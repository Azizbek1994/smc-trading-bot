import MetaTrader5 as mt5
from flask import Flask, jsonify
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app)

# MT5 ga ulanish
if not mt5.initialize():
    print("MT5 ulanmadi!")
    quit()

def get_active_symbol():
    """Terminalda Market Watch'da tanlangan birinchi aktiv simvolni olish"""
    symbols = mt5.symbols_get()
    for s in symbols:
        if s.select:
            return s.name
    return "XAUUSDm"

@app.route('/get-data', methods=['GET'])
def get_data():
    try:
        symbol = get_active_symbol()
        tick = mt5.symbol_info_tick(symbol)
        # Grafik chiroyli chiqishi uchun 100 ta sham olamiz
        rates = mt5.copy_rates_from_pos(symbol, mt5.TIMEFRAME_M15, 0, 100)

        if tick is None or rates is None:
            return jsonify({"status": "error"}), 500

        candles = [
            {
                "time": int(r['time']), 
                "open": float(r['open']), 
                "high": float(r['high']), 
                "low": float(r['low']), 
                "close": float(r['close'])
            } for r in rates
        ]

        return jsonify({
            "status": "connected",
            "symbol": symbol,
            "price": tick.bid,
            "candles": candles
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("Python Server 5000-portda ishga tushdi...")
    app.run(host='0.0.0.0', port=5000)