import streamlit as st
import pandas as pd
import requests
from plotly import graph_objects as go
from plotly import io as pio

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
sell = requests.get("https://logam-mulia.vercel.app/api/price-gold-antam-sell").json()
buy = requests.get("https://logam-mulia.vercel.app/api/price-gold-antam-buy").json()

# if response valid save to json, if not print error and process from local
if sell and buy:
    with open('sell.json', 'w') as f:
        json.dump(sell, f)
    with open('buy.json', 'w') as f:
        json.dump(buy, f)
else:
    print("Error fetching data from API")
    with open('sell.json', 'r') as f:
        sell = json.load(f)
    with open('buy.json', 'r') as f:
        buy = json.load(f)

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
st.title("Harga Jual dan Beli Emas Antam")
st.write("Visualisasi harga jual, beli, dan selisih emas Antam.")

# Plotly chart
fig = go.Figure()

# Add area chart for "Sell" (red)
fig.add_trace(go.Scatter(
    x=df_combined['date'], 
    y=df_combined['amount_sell'], 
    mode='lines', 
    name='Jual',
    fill='tozeroy',  # Fill to the x-axis
    line=dict(color='#FF4136')  # Set line color to red
))

# Add area chart for "Buy" (green)
fig.add_trace(go.Scatter(
    x=df_combined['date'], 
    y=df_combined['amount_buy'], 
    mode='lines', 
    name='Beli',
    fill='tozeroy',  # Fill to the x-axis
    line=dict(color='#2ECC40')  # Set line color to green
))

# Add line chart for "Difference" (blue) on the right y-axis
fig.add_trace(go.Scatter(
    x=df_combined['date'], 
    y=df_combined['difference'], 
    mode='lines', 
    name='Selisih',
    line=dict(color='#0074D9'),  # Set line color to blue
    yaxis='y2'
))

# Update layout
fig.update_layout(
    title=dict(
        text='Harga Jual dan Beli Emas Antam',
        font=dict(size=24),  # Increase font size
        x=0.5,  # Center the title
        xanchor='center'
    ),
    xaxis_title='Date',
    yaxis_title='Harga',
    xaxis=dict(
        showgrid=False  # Remove grid for x-axis
    ),
    yaxis=dict(
        tickprefix='Rp ',  # Add "Rp " prefix for Indonesian Rupiah
        separatethousands=True,  # Add thousand separators
        tickformat=',.0f',  # Disable abbreviation (e.g., M, K)
        showgrid=False  # Remove grid for y-axis
    ),
    yaxis2=dict(
        title='Selisih',
        overlaying='y',  # Overlay on the same plot
        side='right',    # Place on the right side
        tickprefix='Rp ',  # Add "Rp " prefix for Indonesian Rupiah
        separatethousands=True,  # Add thousand separators
        tickformat=',.0f',  # Disable abbreviation (e.g., M, K)
        showgrid=False  # Remove grid for secondary y-axis
    ),
    legend=dict(
        orientation="h",  # Horizontal legend
        x=0.5, 
        y=-0.2,  # Position below the chart
        xanchor='center'
    ),
    hovermode="x"  # Show all y values for the same x value
)

# Display the chart
st.plotly_chart(fig, use_container_width=True)

# Display the DataFrame
st.subheader("Tabel")
st.dataframe(df_combined)