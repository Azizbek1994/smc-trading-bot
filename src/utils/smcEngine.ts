import { PriceData, SMCAnnotation } from '../types';

export const generateMockData = (count: number = 100): PriceData[] => {
  const data: PriceData[] = [];
  let currentPrice = 1.1200;
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setMinutes(now.getMinutes() - (count - i) * 15);
    
    const volatility = 0.0010;
    const open = currentPrice;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    
    data.push({
      time: date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0],
      open,
      high,
      low,
      close
    });
    currentPrice = close;
  }
  return data;
};

export const analyzeSMC = (data: PriceData[]): SMCAnnotation[] => {
  const annotations: SMCAnnotation[] = [];
  
  // Simple logic to find mock BOS/CHoCH for demo
  for (let i = 10; i < data.length - 5; i++) {
    if (data[i].high > data[i-1].high && data[i].high > data[i+1].high) {
      if (Math.random() > 0.8) {
        annotations.push({
          type: 'BOS',
          price: data[i].high,
          time: data[i].time,
          label: 'BOS',
          color: '#3b82f6'
        });
      }
    }
    
    if (data[i].low < data[i-1].low && data[i].low < data[i+1].low) {
      if (Math.random() > 0.9) {
        annotations.push({
          type: 'CHoCH',
          price: data[i].low,
          time: data[i].time,
          label: 'CHoCH',
          color: '#ef4444'
        });
      }
    }
  }
  
  return annotations;
};
