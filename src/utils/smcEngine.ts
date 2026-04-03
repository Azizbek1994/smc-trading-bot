// src/utils/smcEngine.ts

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SMCResult {
  bos: any[];
  choch: any[];
  orderBlocks: any[];
}

export const smcEngine = (data: Candle[]): SMCResult => {
  const bos: any[] = [];
  const choch: any[] = [];
  const orderBlocks: any[] = [];

  if (data.length < 5) return { bos, choch, orderBlocks };

  // SMC Logikasi (Soddalashtirilgan mantiq)
  for (let i = 2; i < data.length; i++) {
    const current = data[i];
    const prev = data[i - 1];

    // BOS (Break of Structure) aniqlash
    if (current.close > prev.high) {
      bos.push({ time: current.time, price: current.high, type: 'BOS' });
    }

    // CHoCH (Change of Character) aniqlash
    if (current.close < prev.low && data[i-2].close > data[i-2].open) {
      choch.push({ time: current.time, price: current.low, type: 'CHoCH' });
    }
    
    // Order Block (OB) aniqlash
    if (Math.abs(current.close - current.open) > (prev.high - prev.low) * 2) {
        orderBlocks.push({ time: current.time, price: current.low, type: 'OB' });
    }
  }

  return { bos, choch, orderBlocks };
};