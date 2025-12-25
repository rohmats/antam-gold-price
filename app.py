import streamlit as st
import pandas as pd
from plotly import graph_objects as go
from plotly import io as pio
import json
from datetime import date, timedelta

st.set_page_config(
    page_title="Harga Emas Antam",
    page_icon=":bar_chart:",
    layout="wide",
    initial_sidebar_state="collapsed"
)

pio.templates.default = "plotly_dark"

# Function to process JSON data into a DataFrame
@st.cache_data
def process_json_to_dataframe(data):
    df = pd.DataFrame(data)
    df.rename(columns={df.columns[0]: "date", df.columns[1]: "amount"}, inplace=True)
    if df['date'].max() > 10**10:
        df['date'] = df['date'] // 1000
    df['date'] = pd.to_datetime(df['date'], unit='s').dt.date
    df['amount'] = pd.to_numeric(df['amount'])
    return df

@st.cache_data
def load_local_data():
    try:
        with open('antam_sell.json', 'r', encoding='utf-8') as f:
            sell_data = json.load(f)
        with open('antam_buy.json', 'r', encoding='utf-8') as f:
            buy_data = json.load(f)
        return sell_data, buy_data
    except FileNotFoundError:
        st.error("File antam_sell.json atau antam_buy.json tidak ditemukan. Pastikan scraper sudah berjalan.")
        st.stop()

# Load and process data
sell, buy = load_local_data()
df_sell = process_json_to_dataframe(sell)
df_buy = process_json_to_dataframe(buy)

df_combined = pd.merge(df_sell, df_buy, on='date', how='outer', suffixes=('_sell', '_buy'))
df_combined['difference'] = df_combined['amount_sell'] - df_combined['amount_buy']
df_combined = df_combined.drop_duplicates(subset=['date'], keep='last').sort_values('date')

# Add tabs for different sections
tab1, tab2 = st.tabs(["Harga Emas", "Simulasi Buyback"])

# Tab 1: Harga Emas (existing content)
with tab1:
    st.title("Harga Emas Antam")
    st.markdown(
        """
        Aplikasi ini dibuat dari keresahan pribadi: ribet saat mengecek harga emas karena harus membuka beberapa halaman. 
        Aplikasi ringkas ini menyatukan harga jual dan beli dalam satu grafik dan tabel agar lebih cepat dibandingkan. 
        Tersedia juga fitur Simulasi Buyback untuk menghitung perkiraan keuntungan atau kerugian dari buyback emas Anda.
        Sumber data: [Logam Mulia - Antam](https://logammulia.com).
        """
    )
    
    relative_date_options = ["7 Hari Terakhir", "30 Hari Terakhir", "6 Bulan Terakhir", "1 Tahun Terakhir", "Tampilkan Semua"]
    selected_option = st.selectbox("Pilih Rentang Waktu", relative_date_options, index=3)

    date_mapping = {
        "7 Hari Terakhir": (date.today() - timedelta(days=6), date.today()),
        "30 Hari Terakhir": (date.today() - timedelta(days=29), date.today()),
        "6 Bulan Terakhir": (date.today() - timedelta(days=179), date.today()),
        "1 Tahun Terakhir": (date.today().replace(year=date.today().year - 1) + timedelta(days=1), date.today()),
        "Tampilkan Semua": (df_combined['date'].min(), df_combined['date'].max()),
    }
    start_date, end_date = date_mapping[selected_option]

    df_filtered = df_combined[(df_combined['date'] >= start_date) & (df_combined['date'] <= end_date)].copy()

    fig = go.Figure()
    if not df_filtered.empty:
        fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['amount_sell'], mode='lines', name='Jual',
                                 fill='tozeroy', line=dict(color='#FF4136'), hovertemplate='%{y:,.0f}<extra></extra>'))
        fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['amount_buy'], mode='lines', name='Beli',
                                 fill='tozeroy', line=dict(color='#2ECC40'), hovertemplate='%{y:,.0f}<extra></extra>'))
        fig.add_trace(go.Scatter(x=df_filtered['date'], y=df_filtered['difference'], mode='lines', name='Selisih',
                                 line=dict(color='#0074D9'), yaxis='y2', hovertemplate='%{y:,.0f}<extra></extra>'))
        
        y_min = min(df_filtered['amount_sell'].min(), df_filtered['amount_buy'].min()) - 50000
        y_max = max(df_filtered['amount_sell'].max(), df_filtered['amount_buy'].max()) + 50000
        
        fig.update_layout(
            title=dict(text="Harga Jual, Beli, dan Selisih Emas Antam", font=dict(size=16), x=0.5, xanchor='center'),
            xaxis_title='Tanggal',
            yaxis_title='Harga (Rp)',
            xaxis=dict(showgrid=False, tickformat='%d %b %Y'),
            yaxis=dict(separatethousands=True, showgrid=False, range=[y_min, y_max]),
            yaxis2=dict(title='Selisih (Rp)', showgrid=False, overlaying='y', side='right', separatethousands=True),
            legend=dict(orientation="h", x=0.5, y=1.1, xanchor='center', yanchor='top'),
            hovermode="x",
            height=600
        )
        st.subheader("Grafik")
    else:
        fig.add_annotation(text="Tidak ada data untuk rentang ini", xref="paper", yref="paper", x=0.5, y=0.5, showarrow=False)
        fig.update_layout(height=400)
    
    st.plotly_chart(fig, config={"displayModeBar": False})

    df_filtered['amount_sell_diff'] = df_filtered['amount_sell'].diff().fillna(0)
    df_filtered['amount_buy_diff'] = df_filtered['amount_buy'].diff().fillna(0)
    df_filtered['difference_diff'] = df_filtered['difference'].diff().fillna(0)
    df_filtered = df_filtered.sort_values(by='date', ascending=False)
    
    df_display = df_filtered[['date', 'amount_sell', 'amount_sell_diff', 'amount_buy', 'amount_buy_diff', 'difference', 'difference_diff']].copy()
    df_display['date'] = df_display['date'].apply(lambda x: x.strftime('%d %B %Y'))
    df_display.columns = ['Tanggal', 'Harga Jual', 'Perubahan Jual', 'Harga Beli', 'Perubahan Beli', 'Spread', 'Perubahan Spread']
    
    st.subheader("Tabel")
    st.dataframe(
        df_display,
        hide_index=True,
        use_container_width=True,
        column_config={
            "Tanggal": st.column_config.DateColumn("Tanggal", width="small", format="localized"),
            "Harga Jual": st.column_config.NumberColumn("Harga Jual", width="medium", format="localized"),
            "Perubahan Jual": st.column_config.NumberColumn("Perubahan Jual", width="small", format="localized"),
            "Harga Beli": st.column_config.NumberColumn("Harga Beli", width="medium", format="localized"),
            "Perubahan Beli": st.column_config.NumberColumn("Perubahan Beli", width="small", format="localized"),
            "Spread": st.column_config.NumberColumn("Spread", width="medium", format="localized"),
            "Perubahan Spread": st.column_config.NumberColumn("Perubahan Spread", width="small", format="localized"),
        }
    )


with tab2:
    st.title("Simulasi Buyback")
    st.markdown("Gunakan tabel di bawah ini untuk menghitung estimasi keuntungan/rugi dari buyback emas Anda.")

    if "buyback_results" not in st.session_state:
        st.session_state.buyback_results = []

    last_buyback_date = df_combined['date'].max()
    today_buyback_price = df_combined.loc[df_combined['date'] == last_buyback_date, 'amount_buy'].values[0]
    st.info(f"Harga Buyback Terkini ({last_buyback_date.strftime('%d %B %Y')}): Rp {today_buyback_price:,.0f}")

    with st.form("buyback_form", clear_on_submit=True):
        st.subheader("Tambah Data Pembelian Emas")
        col1, col2 = st.columns(2)
        with col1:
            jumlah_emas = st.number_input("Jumlah Emas (gram)", min_value=0.0, step=0.1, value=0.0)
        with col2:
            tanggal_beli = st.date_input("Tanggal Beli", value=date.today())
        submitted = st.form_submit_button("Hitung")

    if submitted and jumlah_emas > 0:
        tanggal_beli = pd.to_datetime(tanggal_beli).date()
        
        if tanggal_beli not in df_combined['date'].values:
            nearest_date = df_combined[df_combined['date'] < tanggal_beli]['date'].max()
            if not nearest_date:
                st.error("Tanggal yang dipilih tidak tersedia dan tidak ada tanggal sebelumnya.")
                st.stop()
            harga_beli_per_gram = df_combined.loc[df_combined['date'] == nearest_date, 'amount_sell'].values[0]
            st.warning(f"Tanggal yang dipilih tidak tersedia. Menggunakan harga dari {nearest_date.strftime('%d %B %Y')}.")
        else:
            harga_beli_per_gram = df_combined.loc[df_combined['date'] == tanggal_beli, 'amount_sell'].values[0]
        
        col1, col2 = st.columns(2)
        with col1:
            st.success(f"Harga beli per gram pada {tanggal_beli.strftime('%d %B %Y')}: **Rp {harga_beli_per_gram:,.0f}**")
        with col2:
            st.success(f"Total harga beli: **Rp {jumlah_emas * harga_beli_per_gram:,.0f}**")
        
        harga_beli_total = jumlah_emas * harga_beli_per_gram
        harga_jual_total = jumlah_emas * today_buyback_price
        keuntungan_rugi = harga_jual_total - harga_beli_total

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

    if st.session_state.buyback_results:
        st.subheader("Hasil Simulasi")
        result_data = pd.DataFrame(st.session_state.buyback_results)
        result_data.index += 1

        total_emas = result_data['Jumlah Emas (gram)'].sum()
        total_harga_beli = result_data['Total Harga Beli (Rp)'].sum()
        total_harga_jual = result_data['Total Harga Jual (Rp)'].sum()
        total_profit_loss = result_data['Keuntungan/Rugi (Rp)'].sum()
        profit_loss_percentage = (total_profit_loss / total_harga_beli) * 100 if total_harga_beli > 0 else 0

        st.dataframe(
            result_data,
            use_container_width=True,
            column_config={
                "Jumlah Emas (gram)": st.column_config.NumberColumn("Jumlah Emas (gram)", width="small", format="localized"),
                "Tanggal Beli": st.column_config.DateColumn("Tanggal Beli", width="small", format="localized"),
                "Harga Beli per Gram (Rp)": st.column_config.NumberColumn("Harga Beli per Gram (Rp)", width="medium", format="localized"),
                "Total Harga Beli (Rp)": st.column_config.NumberColumn("Total Harga Beli (Rp)", width="medium", format="localized"),
                "Total Harga Jual (Rp)": st.column_config.NumberColumn("Total Harga Jual (Rp)", width="medium", format="localized"),
                "Keuntungan/Rugi (Rp)": st.column_config.NumberColumn("Keuntungan/Rugi (Rp)", width="medium", format="localized"),
            }
        )

        col1, col2 = st.columns(2)
        with col1:
            st.info(f"**Total Emas**: {total_emas:,.1f} gram\n\n**Total Harga Beli**: Rp {total_harga_beli:,.0f}")
        with col2:
            if total_profit_loss >= 0:
                st.success(f"**Total Keuntungan**: Rp {total_profit_loss:,.0f}\n\n**Persentase**: {profit_loss_percentage:.2f}%")
            else:
                st.error(f"**Total Rugi**: Rp {total_profit_loss:,.0f}\n\n**Persentase**: {profit_loss_percentage:.2f}%")

        if st.button("Reset Data"):
            st.session_state.buyback_results = []

        st.markdown("""
        ---
        **Disclaimer**: 
        - Perhitungan ini hanya bersifat simulasi dan estimasi.
        - Belum memperhitungkan biaya transaksi, pajak, atau biaya lainnya.
        - Harga buyback dapat berubah sewaktu-waktu sesuai dengan kebijakan penyedia layanan.
        - Pastikan untuk memverifikasi harga terkini sebelum melakukan transaksi.
        """)

st.info(f"Data terakhir diperbarui pada: {df_combined['date'].max().strftime('%d %B %Y')}")
