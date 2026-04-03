export interface Candle {
  high: number;
  low: number;
  close: number;
  open: number;
  time: number;
}

export const smcEngine = (candles: Candle[]) => {
  if (!candles || candles.length < 10) return null;

  const last20 = candles.slice(-20);
  const highPrices = last20.map(c => c.high);
  const lowPrices = last20.map(c => c.low);

  const swingHigh = Math.max(...highPrices);
  const swingLow = Math.min(...lowPrices);
  const equilibrium = (swingHigh + swingLow) / 2;
  const currentPrice = candles[candles.length - 1].close;

  return {
    currentPrice,
    equilibrium,
    swingHigh,
    swingLow,
    isDiscount: currentPrice < equilibrium,
    isPremium: currentPrice > equilibrium,
    suggestedSLBuy: swingLow - 0.05, 
    suggestedSLSell: swingHigh + 0.05
  };
};