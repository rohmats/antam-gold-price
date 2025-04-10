import streamlit as st
import pandas as pd
import requests
from plotly import graph_objects as go
from plotly import io as pio
import json
from datetime import date

# Set page configuration
st.set_page_config(
    page_title="Harga Emas Antam",
    page_icon=":bar_chart:",
    layout="wide",
    initial_sidebar_state="collapsed"  # Change from "expanded" to "collapsed"
)

# Set Plotly dark theme
pio.templates.default = "plotly_dark"

# Function to process JSON data into a DataFrame
def process_json_to_dataframe(data):
    # Create DataFrame
    df = pd.DataFrame(data)

    # Rename columns
    df.rename(columns={df.columns[0]: "date", df.columns[1]: "amount"}, inplace=True)

    # Check if timestamps are in milliseconds and convert to seconds
    if df['date'].max() > 10**10:  # Assuming timestamps in milliseconds
        df['date'] = df['date'] // 1000

    # Convert date column to date from Unix epoch timestamp
    df['date'] = pd.to_datetime(df['date'], unit='s')

    # Convert amount column to numeric
    df['amount'] = pd.to_numeric(df['amount'])

    return df

# Fetch data from APIs
e = None  # Initialize 'e' to ensure it is defined
try:
    sell_response = requests.get("https://logam-mulia.vercel.app/api/price-gold-antam-sell")
    buy_response = requests.get("https://logam-mulia.vercel.app/api/price-gold-antam-buy")
    sell_response.raise_for_status()
    buy_response.raise_for_status()
    sell = sell_response.json()
    buy = buy_response.json()

    # Save to local JSON files
    with open('antam_sell.json', 'w', encoding='utf-8') as f:
        json.dump(sell, f)
    with open('antam_buy.json', 'w', encoding='utf-8') as f:
        json.dump(buy, f)
except (requests.RequestException, json.JSONDecodeError) as error:
    e = error  # Assign the error to 'e'
    try:
        with open('antam_sell.json', 'r', encoding='utf-8') as f:
            sell = json.load(f)
        with open('antam_buy.json', 'r', encoding='utf-8') as f:
            buy = json.load(f)
    except FileNotFoundError:
        st.error("Local data files not found. Exiting.")
        st.stop()

# Process data into DataFrames
df_sell = process_json_to_dataframe(sell)
df_buy = process_json_to_dataframe(buy)

# Combine the two DataFrames by date
df_combined = pd.merge(df_sell, df_buy, on='date', how='outer', suffixes=('_sell', '_buy'))

# Fill NaN values with 0
df_combined.fillna(0, inplace=True)

# Convert datetime to date
df_combined['date'] = df_combined['date'].dt.date

# Add a column for the difference between buy and sell
df_combined['difference'] = df_combined['amount_sell'] - df_combined['amount_buy']

# Filter date from 2024-01-01
df_combined = df_combined[df_combined['date'] >= pd.to_datetime('2024-01-01').date()]

# Remove duplicates, keep the last
df_combined = df_combined.drop_duplicates(subset=['date'], keep='last')

# Streamlit app
st.title("Harga Emas Antam")

# Sidebar for user input
st.sidebar.title("Pengaturan")
st.sidebar.markdown("Pilih rentang tanggal untuk menampilkan data.")
start_date = st.sidebar.date_input("Tanggal Mulai", value=date.today().replace(year=date.today().year - 1))
end_date = st.sidebar.date_input("Tanggal Akhir", value=date.today())
if start_date > end_date:
    st.sidebar.error("Tanggal mulai harus lebih awal dari tanggal akhir.")

# Filter DataFrame based on user input
with st.spinner("Memproses data..."):
    df_filtered = df_combined[(df_combined['date'] >= start_date) & (df_combined['date'] <= end_date)]
    if df_filtered.empty:
        st.warning("Tidak ada data untuk rentang tanggal yang dipilih.")
    else:
        # Plotly chart
        fig = go.Figure()

        # Add area chart for "Sell" (red)
        fig.add_trace(go.Scatter(
            x=df_filtered['date'], 
            y=df_filtered['amount_sell'], 
            mode='lines', 
            name='Jual',
            fill='tozeroy',  # Fill to the x-axis
            line=dict(color='#FF4136')  # Set line color to red
        ))

        # Add area chart for "Buy" (green)
        fig.add_trace(go.Scatter(
            x=df_filtered['date'], 
            y=df_filtered['amount_buy'], 
            mode='lines', 
            name='Beli',
            fill='tozeroy',  # Fill to the x-axis
            line=dict(color='#2ECC40')  # Set line color to green
        ))

        # Add line chart for "Difference" (blue) on the right y-axis
        fig.add_trace(go.Scatter(
            x=df_filtered['date'], 
            y=df_filtered['difference'], 
            mode='lines', 
            name='Selisih',
            line=dict(color='#0074D9'),  # Set line color to blue
            yaxis='y2'
        ))

        # Update layout
        fig.update_layout(
            title=dict(
                text="Harga Jual, Beli, dan Selisih Emas Antam",
                font=dict(size=24),  # Increase font size
                x=0.5,  # Center the title
                xanchor='center'
            ),
            xaxis_title='Tanggal',
            yaxis_title='Harga',
            xaxis=dict(
                showgrid=False,  # Remove grid for x-axis
                range=[df_filtered['date'].iloc[-10], df_filtered['date'].iloc[-1]]  # Focus on the last 10 data points
            ),
            yaxis=dict(
                tickprefix='Rp ',  # Add "Rp " prefix for Indonesian Rupiah
                separatethousands=True,  # Add thousand separators
                tickformat=',.0f',  # Disable abbreviation (e.g., M, K)
                showgrid=False,  # Remove grid for y-axis
                showticklabels=False  # Hide y-axis tick labels
            ),
            yaxis2=dict(
                title='Selisih',
                overlaying='y',  # Overlay on the same plot
                side='right',    # Place on the right side
                tickprefix='Rp ',  # Add "Rp " prefix for Indonesian Rupiah
                separatethousands=True,  # Add thousand separators
                tickformat=',.0f',  # Disable abbreviation (e.g., M, K)
                showgrid=False,  # Remove grid for secondary y-axis
                showticklabels=False  # Hide secondary y-axis tick labels
            ),
            legend=dict(
                orientation="h",  # Horizontal legend
                x=0.5, 
                y=-0.2,  # Position below the chart
                xanchor='center'
            ),
            hovermode="x"  # Show all y values for the same x value
        )

        # Set hover to the last data point
        fig.add_annotation(
            x=df_filtered['date'].iloc[-1],
            y=df_filtered['amount_sell'].iloc[-1],
            text="Last Data",
            showarrow=True,
            arrowhead=1
        )

        # Display the chart
        st.subheader("Grafik")
        # Set the height of the chart in the layout
        fig.update_layout(height=800)
        st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

        # Display the DataFrame
        st.subheader("Tabel")
        # sort the DataFrame by date in descending order
        df_filtered = df_filtered.sort_values(by='date', ascending=False)

        # Format date as Indonesian and values as Rupiah
        df_filtered['date'] = df_filtered['date'].apply(lambda x: x.strftime('%d %B %Y'))
        df_filtered['amount_sell'] = df_filtered['amount_sell'].apply(lambda x: f"Rp {x:,.0f}".replace(',', '.'))
        df_filtered['amount_buy'] = df_filtered['amount_buy'].apply(lambda x: f"Rp {x:,.0f}".replace(',', '.'))
        df_filtered['difference'] = df_filtered['difference'].apply(lambda x: f"Rp {x:,.0f}".replace(',', '.'))
        df_filtered.rename(columns={
            'date': 'Tanggal',
            'amount_sell': 'Harga Jual',
            'amount_buy': 'Harga Beli',
            'difference': 'Selisih'
        }, inplace=True)

        # Display the formatted DataFrame
        st.dataframe(df_filtered, use_container_width=True, hide_index=True)
        st.markdown(
                """
                <style>
                [data-testid="stElementToolbar"] {
                    display: none;
                }
                </style>
                """,
                unsafe_allow_html=True
            )
        
        st.subheader("Catatan")
        # Display which data is used, last updated date, and data source in one sentence
        st.markdown(
            f"Data terakhir diperbarui pada: {df_combined['date'].max().strftime('%d %B %Y')} menggunakan {'data lokal' if e else 'data dari API'}."
        )
        # Display notes on data fetching
        st.markdown(
            """
            - Data diambil dari API dan disimpan secara lokal.
            - Jika API tidak dapat diakses, data lokal akan digunakan.
            - Data ditampilkan dalam format tabel dan grafik.
            """
        )

        st.subheader("Status API")
        st.markdown(
            """
            - API menggunakan [logam-mulia API](https://logam-mulia.vercel.app/) yang dibuat oleh [ferryops](https://github.com/ferryops/logam-mulia).
            """
        )
        # Display error message if API call fails
        if e:
            st.error(f"Terjadi kesalahan saat mengambil data dari API: \n {e}")
        else:
            st.success("Data berhasil diambil dari API.")