import MetaTrader5 as mt5
import time

# MT5 ga ulanish
if not mt5.initialize():
    print("MT5 initialize failed")
    quit()

def place_smc_trade(symbol, trade_type, sl_price, lot=0.01, tp_usd=3.0):
    """SMC nuqtasiga asoslangan Stop-Loss bilan sdelka ochish"""
    tick = mt5.symbol_info_tick(symbol)
    price = tick.ask if trade_type == mt5.ORDER_TYPE_BUY else tick.bid
    point = mt5.symbol_info(symbol).point

    # Take Profitni taxminan $3 foyda qilib belgilash (1:3+ RR)
    if trade_type == mt5.ORDER_TYPE_BUY:
        tp = price + (tp_usd / (lot * 100))
    else:
        tp = price - (tp_usd / (lot * 100))

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": lot,
        "type": trade_type,
        "price": price,
        "sl": sl_price,
        "tp": tp,
        "magic": 1001,
        "comment": "SMC_Smart_Bot",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    result = mt5.order_send(request)
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(f"Sdelka ochishda xato: {result.comment}")
    return result

def manage_open_positions(symbol, breakeven_profit_usd=0.5):
    """Ochiq sdelkalarni nazorat qilish va Breakeven (0 ga) surish"""
    positions = mt5.positions_get(symbol=symbol)
    if not positions:
        return

    for pos in positions:
        # Agar foyda $0.50 dan oshsa, SLni kirish narxiga suramiz
        if pos.profit >= breakeven_profit_usd:
            # Agar SL hali zararsiz nuqtaga surilmagan bo'lsa (0 bo'lsa yoki eski joyida bo'lsa)
            is_buy = pos.type == mt5.POSITION_TYPE_BUY
            is_sell = pos.type == mt5.POSITION_TYPE_SELL

            need_update = False
            if is_buy and pos.sl < pos.price_open:
                need_update = True
            elif is_sell and (pos.sl > pos.price_open or pos.sl == 0):
                need_update = True

            if need_update:
                request = {
                    "action": mt5.TRADE_ACTION_SLTP,
                    "position": pos.ticket,
                    "sl": pos.price_open, # Kirish narxiga surish
                    "tp": pos.tp
                }
                res = mt5.order_send(request)
                if res.retcode == mt5.TRADE_RETCODE_DONE:
                    print(f"Ticket {pos.ticket} zararsiz nuqtaga (Breakeven) o'tkazildi.")

# Asosiy sikl
while True:
    manage_open_positions("XAUUSDm")
    time.sleep(1) # Har soniyada tekshirib turadi