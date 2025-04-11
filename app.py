import streamlit as st
import pandas as pd
import requests
from plotly import graph_objects as go
from plotly import io as pio
import json
from datetime import date, timedelta
from st_aggrid import AgGrid, GridOptionsBuilder

# Set page configuration
st.set_page_config(
    page_title="Harga Emas Antam",
    page_icon=":bar_chart:",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Set Plotly dark theme
pio.templates.default = "plotly_dark"

# Function to process JSON data into a DataFrame
@st.cache_data
def process_json_to_dataframe(data):
    df = pd.DataFrame(data)
    df.rename(columns={df.columns[0]: "date", df.columns[1]: "amount"}, inplace=True)
    if df['date'].max() > 10**10:  # Convert milliseconds to seconds if needed
        df['date'] = df['date'] // 1000
    df['date'] = pd.to_datetime(df['date'], unit='s')
    df['amount'] = pd.to_numeric(df['amount'])
    return df

# Function to fetch data from APIs or load local files
@st.cache_data
def fetch_data():
    try:
        sell_response = requests.get("https://logam-mulia.vercel.app/api/price-gold-antam-sell")
        buy_response = requests.get("https://logam-mulia.vercel.app/api/price-gold-antam-buy")
        sell_response.raise_for_status()
        buy_response.raise_for_status()
        sell = sell_response.json()
        buy = buy_response.json()
        with open('antam_sell.json', 'w', encoding='utf-8') as f:
            json.dump(sell, f)
        with open('antam_buy.json', 'w', encoding='utf-8') as f:
            json.dump(buy, f)
        return sell, buy, None
    except (requests.RequestException, json.JSONDecodeError) as error:
        try:
            with open('antam_sell.json', 'r', encoding='utf-8') as f:
                sell = json.load(f)
            with open('antam_buy.json', 'r', encoding='utf-8') as f:
                buy = json.load(f)
            return sell, buy, error
        except FileNotFoundError:
            st.error("Local data files not found. Exiting.")
            st.stop()

# Fetch and process data
sell, buy, e = fetch_data()
df_sell = process_json_to_dataframe(sell)
df_buy = process_json_to_dataframe(buy)

# Combine and preprocess data
df_combined = pd.merge(df_sell, df_buy, on='date', how='outer', suffixes=('_sell', '_buy')).fillna(0)
df_combined['date'] = df_combined['date'].dt.date
df_combined['difference'] = df_combined['amount_sell'] - df_combined['amount_buy']
df_combined = df_combined[df_combined['date'] >= pd.to_datetime('2024-01-01').date()]
df_combined = df_combined.drop_duplicates(subset=['date'], keep='last')

# Streamlit app
st.title("Harga Emas Antam")
st.markdown("### Pilih Rentang Tanggal")

# Dropdown for relative date options
relative_date_options = ["7 Hari Terakhir", "30 Hari Terakhir", "6 Bulan Terakhir", "1 Tahun Terakhir", "Custom"]
selected_option = st.selectbox("Pilih Rentang Waktu", relative_date_options, index=3)

# Determine start and end dates
if selected_option == "7 Hari Terakhir":
    start_date, end_date = date.today() - timedelta(days=7), date.today()
elif selected_option == "30 Hari Terakhir":
    start_date, end_date = date.today() - timedelta(days=30), date.today()
elif selected_option == "6 Bulan Terakhir":
    start_date, end_date = date.today() - timedelta(days=6 * 30), date.today()
elif selected_option == "1 Tahun Terakhir":
    start_date, end_date = date.today().replace(year=date.today().year - 1), date.today()
else:
    col1, col2 = st.columns(2)
    with col1:
        start_date = st.date_input("Tanggal Mulai", value=date.today().replace(year=date.today().year - 1))
    with col2:
        end_date = st.date_input("Tanggal Akhir", value=date.today())
    if start_date > end_date:
        st.error("Tanggal mulai harus lebih awal dari tanggal akhir.")

# Filter data
df_filtered = df_combined[(df_combined['date'] >= start_date) & (df_combined['date'] <= end_date)]
if df_filtered.empty:
    st.warning("Tidak ada data untuk rentang tanggal yang dipilih.")
else:
    # Plotly chart
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['amount_sell'], mode='lines', name='Jual',
                             fill='tozeroy', line=dict(color='#FF4136'), hovertemplate='%{y:,.0f}<extra></extra>'))
    fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['amount_buy'], mode='lines', name='Beli',
                             fill='tozeroy', line=dict(color='#2ECC40'), hovertemplate='%{y:,.0f}<extra></extra>'))
    fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['difference'], mode='lines', name='Selisih',
                             line=dict(color='#0074D9'), yaxis='y2', hovertemplate='%{y:,.0f}<extra></extra>'))
    fig.update_layout(
        title=dict(text="Harga Jual, Beli, dan Selisih Emas Antam", font=dict(size=24), x=0.5, xanchor='center'),
        xaxis_title='Tanggal', yaxis_title='Harga',
        xaxis=dict(showgrid=False, tickformat='%d %b %Y'),
        yaxis=dict(tickprefix='Rp ', separatethousands=True, tickformat=',.0f', showgrid=False),
        yaxis2=dict(title='Selisih', overlaying='y', side='right', tickprefix='Rp ', separatethousands=True, tickformat=',.0f'),
        legend=dict(orientation="h", x=0.5, y=1, xanchor='center', yanchor='top'),
        hovermode="x", height=800
    )
    st.subheader("Grafik")
    st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

    # Format and display table
    df_filtered['amount_sell_change'] = df_filtered['amount_sell'].diff().fillna(0)
    df_filtered['amount_buy_change'] = df_filtered['amount_buy'].diff().fillna(0)
    df_filtered['amount_selisih_change'] = df_filtered['difference'].diff().fillna(0)
    df_filtered.sort_values(by='date', ascending=False, inplace=True)
    df_filtered.rename(columns={
        'date': 'Tanggal', 'amount_sell': 'Harga Jual', 'amount_buy': 'Harga Beli',
        'difference': 'Selisih', 'amount_sell_change': 'Perubahan Jual',
        'amount_buy_change': 'Perubahan Beli', 'amount_selisih_change': 'Perubahan Selisih'
    }, inplace=True)
    df_filtered = df_filtered[['Tanggal', 'Harga Jual', 'Perubahan Jual', 'Harga Beli', 'Perubahan Beli', 'Selisih', 'Perubahan Selisih']]
    st.subheader("Tabel")
    grid_options = GridOptionsBuilder.from_dataframe(df_filtered)
    grid_options.configure_default_column(filterable=True, sortable=True, resizable=True)
    grid_options.configure_pagination(paginationPageSize=10)
    grid_options = grid_options.build()
    AgGrid(df_filtered, gridOptions=grid_options, height=400, fit_columns_on_grid_load=True, theme="streamlit")

    # Notes and API status
    st.subheader("Catatan")
    st.markdown(f"Data terakhir diperbarui pada: {df_combined['date'].max().strftime('%d %B %Y')} menggunakan {'data lokal' if e else 'data dari API'}.")
    st.markdown("""
    - Data diambil dari API dan disimpan secara lokal.
    - Jika API tidak dapat diakses, data lokal akan digunakan.
    - Data ditampilkan dalam format tabel dan grafik.
    """)
    st.subheader("Status API")
    st.markdown("""
    - API menggunakan [logam-mulia API](https://logam-mulia.vercel.app/) yang dibuat oleh [ferryops](https://github.com/ferryops/logam-mulia).
    """)
    if e:
        st.error(f"Terjadi kesalahan saat mengambil data dari API: \n {e}")
    else:
        st.success("Data berhasil diambil dari API.")