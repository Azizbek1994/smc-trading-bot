import MetaTrader5 as mt5
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

# MT5 ulanishini bir marta tekshirib olish
mt5.initialize()

@app.route('/get-data')
def get_data():
    # Oltin simvolini aniqlash
    symbol = "XAUUSD" # Agar brokerda boshqacha bo'lsa (masalan GOLD), shunga o'zgartiring
    
    # Oxirgi 150 ta sham yetarli (tezlik uchun)
    rates = mt5.copy_rates_from_pos(symbol, mt5.TIMEFRAME_M1, 0, 150)
    
    if rates is None:
        return jsonify({"error": "Ma'lumot olinmadi"}), 500
    
    df = pd.DataFrame(rates)
    result = []
    for _, row in df.iterrows():
        result.append({
            "time": int(row['time']),
            "open": float(row['open']),
            "high": float(row['high']),
            "low": float(row['low']),
            "close": float(row['close'])
        })
    
    # Konsolga ko'p yozib tashlamaslik uchun printni olib tashladik
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, threaded=True) # threaded=True ko'p so'rovlar uchun