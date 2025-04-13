import streamlit as st
import pandas as pd
import requests
from plotly import graph_objects as go
from plotly import io as pio
import json
from datetime import date, timedelta

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
    df['date'] = pd.to_datetime(df['date'], unit='s').dt.date
    df['amount'] = pd.to_numeric(df['amount'])
    return df

# Function to fetch data from APIs or load local files
@st.cache_data
def fetch_data():
    headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'id,en-US;q=0.9,en;q=0.8,en-GB;q=0.7',
        'cache-control': 'max-age=0',
        'dnt': '1',
        'priority': 'u=0, i',
        'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-user': '?1',
        'sec-gpc': '1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0',
    }
    try:
        buy_response = requests.get("https://logam-mulia.vercel.app/api/price-gold-antam-buy", timeout=10, headers=headers)
        sell_response = requests.get("https://logam-mulia.vercel.app/api/price-gold-antam-sell", timeout=10, headers=headers)
        sell_response = requests.get("https://logam-mulia.vercel.app/api/price-gold-antam-sell", timeout=10, headers=headers)

        
        buy_response.raise_for_status()
        sell_response.raise_for_status()
        sell_data = sell_response.json()
        buy_data = buy_response.json()
        with open('antam_sell.json', 'w', encoding='utf-8') as f:
            json.dump(sell_data, f)
        with open('antam_buy.json', 'w', encoding='utf-8') as f:
            json.dump(buy_data, f)
        return sell_data, buy_data, None
    except (requests.RequestException, json.JSONDecodeError) as error:
        try:
            with open('antam_sell.json', 'r', encoding='utf-8') as f:
                sell_data_local = json.load(f)
            with open('antam_buy.json', 'r', encoding='utf-8') as f:
                buy_data_local = json.load(f)
            return sell_data_local, buy_data_local, error
        except FileNotFoundError:
            st.error("Local data files not found. Exiting.")
            st.stop()

# Fetch and process data
sell, buy, e = fetch_data()
df_sell = process_json_to_dataframe(sell)
df_buy = process_json_to_dataframe(buy)

# Combine and preprocess data
df_combined = pd.merge(df_sell, df_buy, on='date', how='outer', suffixes=('_sell', '_buy'))
df_combined['date'] = df_combined['date']
df_combined['difference'] = df_combined['amount_sell'] - df_combined['amount_buy']
df_combined = df_combined.drop_duplicates(subset=['date'], keep='last')

# Add tabs for different sections
tab1, tab2 = st.tabs(["Harga Emas", "Simulasi Buyback"])

# Tab 1: Harga Emas (existing content)
with tab1:
    st.title("Harga Emas Antam")
    # Dropdown for relative date options
    relative_date_options = ["7 Hari Terakhir", "30 Hari Terakhir", "6 Bulan Terakhir", "1 Tahun Terakhir", "Tampilkan Semua"]
    selected_option = st.selectbox("Pilih Rentang Waktu", relative_date_options, index=3)

    # Determine start and end dates
    start_date, end_date = None, None  # Default assignment to avoid uninitialized variables
    if selected_option == "7 Hari Terakhir":
        start_date, end_date = date.today() - timedelta(days=6), date.today()
    elif selected_option == "30 Hari Terakhir":
        start_date, end_date = date.today() - timedelta(days=29), date.today()
    elif selected_option == "6 Bulan Terakhir":
        start_date, end_date = date.today() - timedelta(days=6 * 30 - 1), date.today()
    elif selected_option == "1 Tahun Terakhir":
        start_date, end_date = date.today().replace(year=date.today().year - 1) + timedelta(days=1), date.today()
    elif selected_option == "Tampilkan Semua":
        start_date, end_date = df_combined['date'].min(), df_combined['date'].max()

    # Filter data
    df_filtered = df_combined[(df_combined['date'] >= start_date) & (df_combined['date'] <= end_date)]

    # Plotly chart
    if not df_filtered.empty:
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['amount_sell'], mode='lines', name='Jual',
                                 fill='tozeroy', line=dict(color='#FF4136'), hovertemplate='%{y:,.0f}<extra></extra>'))
        fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['amount_buy'], mode='lines', name='Beli',
                                 fill='tozeroy', line=dict(color='#2ECC40'), hovertemplate='%{y:,.0f}<extra></extra>'))
        fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['difference'], mode='lines', name='Selisih',
                                 line=dict(color='#0074D9'), yaxis='y2', hovertemplate='%{y:,.0f}<extra></extra>'))
        fig.update_layout(
            title=dict(text="Harga Jual, Beli, dan Selisih Emas Antam", font=dict(size=16), x=0.5, xanchor='center'),
            xaxis_title='Tanggal',
            yaxis_title='Harga (Rp)',
            xaxis=dict(
                showgrid=False,
                tickformat='%d %b %Y'  # Keep date formatting for x-axis
            ),
            yaxis=dict(
                separatethousands=True,
                showgrid=False
            ),
            yaxis2=dict(
                title='Selisih (Rp)',
                showgrid=False,
                overlaying='y',
                side='right',
                separatethousands=True
            ),
            legend=dict(orientation="h", x=0.5, y=1.1, xanchor='center', yanchor='top'),
            hovermode="x",
            height=600
        )
        st.subheader("Grafik")
        st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

    # copy data for display dataframe
    df_filtered = df_filtered.copy()

    # Calculate difference from previous day for each column
    df_filtered['amount_sell_diff'] = df_filtered['amount_sell'].diff().fillna(0)
    df_filtered['amount_buy_diff'] = df_filtered['amount_buy'].diff().fillna(0)
    df_filtered['difference_diff'] = df_filtered['difference'].diff().fillna(0)

    # order by date descending
    df_filtered = df_filtered.sort_values(by='date', ascending=False)

    # Format date for display
    df_filtered['date'] = df_filtered['date'].apply(lambda x: x.strftime('%d %B %Y'))
    # Format columns
    df_filtered['amount_sell'] = df_filtered['amount_sell'].apply(lambda x: f"{x:,.0f}")
    df_filtered['amount_buy'] = df_filtered['amount_buy'].apply(lambda x: f"{x:,.0f}")
    df_filtered['difference'] = df_filtered['difference'].apply(lambda x: f"{x:,.0f}")
    df_filtered['amount_sell_diff'] = df_filtered['amount_sell_diff'].apply(lambda x: f"{x:,.0f}")
    df_filtered['amount_buy_diff'] = df_filtered['amount_buy_diff'].apply(lambda x: f"{x:,.0f}")
    df_filtered['difference_diff'] = df_filtered['difference_diff'].apply(lambda x: f"{x:,.0f}")

    # rename columns for display
    df_filtered.rename(columns={
        'date': 'Tanggal',
        'amount_sell': 'Harga Jual',
        'amount_buy': 'Harga Beli',
        'difference': 'Spread',
        'amount_sell_diff': 'Perubahan Jual',
        'amount_buy_diff': 'Perubahan Beli',
        'difference_diff': 'Perubahan Spread'
    }, inplace=True)

    # reorder columns for display
    df_filtered = df_filtered[['Tanggal', 'Harga Jual', 'Perubahan Jual', 'Harga Beli', 'Perubahan Beli', 'Spread', 'Perubahan Spread']]

    # display dataframe
    st.subheader("Tabel")
    st.dataframe(df_filtered, use_container_width=True, hide_index=True)

    # Notes and API status
    st.subheader("Catatan")
    st.markdown("""
    - Data diambil dari API dan disimpan secara lokal.
    - Jika API tidak dapat diakses, data lokal akan digunakan.
    - Data ditampilkan dalam format tabel dan grafik.
    """)
    st.info(f"Data terakhir diperbarui pada: {df_combined['date'].max().strftime('%d %B %Y')} menggunakan {'data lokal' if e else 'data dari API'}.")

    st.subheader("Status API")
    st.markdown("""
    - API menggunakan [logam-mulia API](https://logam-mulia.vercel.app/) yang dibuat oleh [ferryops](https://github.com/ferryops/logam-mulia).
    """)
    if e:
        st.error(f"Terjadi kesalahan saat mengambil data dari API: \n {e}")
    else:
        st.success("Data berhasil diambil dari API.")



# Tab 2: Simulasi Buyback
with tab2:
    st.title("Simulasi Buyback")
    st.markdown("Gunakan tabel di bawah ini untuk menghitung estimasi keuntungan/rugi dari buyback emas Anda.")

    # Initialize session state for storing results
    if "buyback_results" not in st.session_state:
        st.session_state.buyback_results = []

    # Last buyback date and price
    last_buyback_date = df_combined['date'].max()
    today_buyback_price = df_combined.loc[df_combined['date'] == last_buyback_date, 'amount_buy'].values[0]
    st.info(f"Harga Buyback Terkini ({last_buyback_date.strftime('%d %B %Y')}): Rp {today_buyback_price:,.0f}")

    # Create a form for user input
    with st.form("buyback_form", clear_on_submit=True):
        st.subheader("Tambah Data Pembelian Emas")
        col1, col2 = st.columns(2)
        with col1:
            jumlah_emas = st.number_input("Jumlah Emas (gram)", min_value=0.0, step=0.1, value=0.0)
        with col2:
            tanggal_beli = st.date_input("Tanggal Beli", value=date.today())
        submitted = st.form_submit_button("Hitung")

    # Process user input after form submission
    if submitted and jumlah_emas > 0:
        # Get the buy price for the selected date
        # If the date is not found, use the nearest available date
        tanggal_beli = pd.to_datetime(tanggal_beli).date()
        if tanggal_beli not in df_combined['date'].values:
            nearest_date = df_combined[df_combined['date'] < tanggal_beli]['date'].max()
            if nearest_date:
                harga_beli_per_gram = df_combined.loc[df_combined['date'] == nearest_date, 'amount_sell'].values[0]
                st.warning(f"Tanggal yang dipilih tidak tersedia. Menggunakan harga dari {nearest_date.strftime('%d %B %Y')}.")
            else:
                st.error("Tanggal yang dipilih tidak tersedia dan tidak ada tanggal sebelumnya.")
                st.stop()
        else:
            harga_beli_per_gram = df_combined.loc[df_combined['date'] == tanggal_beli, 'amount_sell'].values[0]
            col1, col2 = st.columns(2)
            with col1:
                st.success(f"Harga beli per gram pada {tanggal_beli.strftime('%d %B %Y')}: **Rp {harga_beli_per_gram:,.0f}**")
            with col2:
                st.success(f"Total harga beli: **Rp {jumlah_emas * harga_beli_per_gram:,.0f}**")
        
        # Calculate total buy and sell prices
        harga_beli_per_gram = float(harga_beli_per_gram)
        harga_beli_total = jumlah_emas * harga_beli_per_gram
        harga_jual_total = jumlah_emas * today_buyback_price
        keuntungan_rugi = harga_jual_total - harga_beli_total

        # Append the result to session state
        st.session_state.buyback_results.append({
            "Jumlah Emas (gram)": jumlah_emas,
            "Tanggal Beli": tanggal_beli,
            "Harga Beli per Gram (Rp)": harga_beli_per_gram,
            "Total Harga Beli (Rp)": harga_beli_total,
            "Total Harga Jual (Rp)": harga_jual_total,
            "Keuntungan/Rugi (Rp)": keuntungan_rugi
        })

    elif submitted:
        st.warning("Masukkan jumlah emas yang valid untuk menghitung.")

# Display all results
if st.session_state.buyback_results:
    st.subheader("Hasil Simulasi")
    result_data = pd.DataFrame(st.session_state.buyback_results)
    result_data.index += 1  # Increment the index for display
    # format date for display
    result_data['Tanggal Beli'] = pd.to_datetime(result_data['Tanggal Beli']).dt.strftime('%d-%m-%Y')
    # Format numerical columns
    result_data['Jumlah Emas (gram)'] = result_data['Jumlah Emas (gram)'].apply(lambda x: f"{x:,.1f}")
    result_data['Harga Beli per Gram (Rp)'] = result_data['Harga Beli per Gram (Rp)'].apply(lambda x: f"{x:,.0f}")
    result_data['Total Harga Beli (Rp)'] = result_data['Total Harga Beli (Rp)'].apply(lambda x: f"{x:,.0f}")
    result_data['Total Harga Jual (Rp)'] = result_data['Total Harga Jual (Rp)'].apply(lambda x: f"{x:,.0f}")
    result_data['Keuntungan/Rugi (Rp)'] = result_data['Keuntungan/Rugi (Rp)'].apply(lambda x: f"{x:,.0f}")

    # Display the formatted table
    st.dataframe(result_data, use_container_width=True)
    # Total calculations
    total_emas = result_data['Jumlah Emas (gram)'].astype(float).sum()
    total_harga_beli = result_data['Total Harga Beli (Rp)'].str.replace('Rp ', '').str.replace(',', '').astype(float).sum()
    total_harga_jual = result_data['Total Harga Jual (Rp)'].str.replace('Rp ', '').str.replace(',', '').astype(float).sum()
    total_profit_loss = result_data['Keuntungan/Rugi (Rp)'].str.replace('Rp ', '').str.replace(',', '').astype(float).sum()
    total_investment = total_harga_beli
    profit_loss_percentage = (total_profit_loss / total_investment) * 100 if total_investment > 0 else 0

    col1, col2 = st.columns(2)
    with col1:
        st.info(f"""
        **Total Emas**: {total_emas:,.1f} gram  
        **Total Harga Beli**: Rp {total_harga_beli:,.0f}
        """)
    with col2:
        if total_profit_loss >= 0:
            st.success(f"""
            **Total Keuntungan**: Rp {total_profit_loss:,.0f}  
            **Total Persentase Keuntungan**: {profit_loss_percentage:.2f}%
            """)
        else:
            st.error(f"""
            **Total Rugi**: Rp {total_profit_loss:,.0f}  
            **Total Persentase Rugi**: {profit_loss_percentage:.2f}%
            """)

    # Add a reset button
    if st.button("Reset Data"):
        # Reset specific session state variables
        if "buyback_results" in st.session_state:
            st.session_state.buyback_results = []

    # Display disclaimer only in Tab 2
    if tab2:
        st.markdown("""
        ---
        **Disclaimer**: 
        - Perhitungan ini hanya bersifat simulasi dan estimasi.
        - Belum memperhitungkan biaya transaksi, pajak, atau biaya lainnya.
        - Harga buyback dapat berubah sewaktu-waktu sesuai dengan kebijakan penyedia layanan.
        - Pastikan untuk memverifikasi harga terkini sebelum melakukan transaksi.
        """)