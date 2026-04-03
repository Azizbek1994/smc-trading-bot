export interface Candle {
  high: number;
  low: number;
  close: number;
  open: number;
  time: string;
}

export const analyzeSMC = (candles: Candle[]) => {
  if (candles.length < 20) return null;

  // 1. Swing High va Swing Low nuqtalarini aniqlash (Stop-Loss uchun)
  const last20 = candles.slice(-20);
  const highPrices = last20.map(c => c.high);
  const lowPrices = last20.map(c => c.low);

  const swingHigh = Math.max(...highPrices);
  const swingLow = Math.min(...lowPrices);

  // 2. Premium/Discount (0.5 Equilibrium) hisoblash
  const equilibrium = (swingHigh + swingLow) / 2;
  const currentPrice = candles[candles.length - 1].close;

  // 3. Bozor holati (Market State)
  const isDiscount = currentPrice < equilibrium;
  const isPremium = currentPrice > equilibrium;

  // 4. Strukturaviy Stop-Loss nuqtalari (SMC bo'yicha)
  // Buy uchun SL eng pastki Swing Lowdan 50 punkt pastroqda
  // Sell uchun SL eng yuqori Swing Highdan 50 punkt teparoqda
  const suggestedSLBuy = swingLow - 0.050; 
  const suggestedSLSell = swingHigh + 0.050;

  return {
    currentPrice,
    equilibrium,
    isDiscount,
    isPremium,
    swingHigh,
    swingLow,
    suggestedSLBuy,
    suggestedSLSell,
    trend: candles[candles.length - 1].close > candles[candles.length - 2].close ? 'BULLISH' : 'BEARISH'
  };
};