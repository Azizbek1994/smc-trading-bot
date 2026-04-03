import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickData, ISeriesApi } from 'lightweight-charts';

const smcLogic = (candles: any[]) => {
  if (!candles || candles.length < 5) return null;
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const sHigh = Math.max(...highs);
  const sLow = Math.min(...lows);
  const eq = (sHigh + sLow) / 2;
  const current = candles[candles.length - 1].close;
  return { sHigh, sLow, eq, isDiscount: current < eq };
};

function App() {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState('BOG\'LANISH...');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: { background: { type: ColorType.Solid, color: '#020617' }, textColor: '#94a3b8' },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      timeScale: { timeVisible: true, borderColor: '#334155' },
    });

    // @ts-ignore - v5 TypeScript xatosini yopish uchun
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e', downColor: '#ef4444', borderVisible: false,
      wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    });
    seriesRef.current = candlestickSeries;

    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-data');
        const json = await response.json();
        if (json.status === 'connected' && json.candles) {
          const analysis = smcLogic(json.candles);
          setData({ ...json, analysis });
          setStatus('ULANGAN');
          const formatted: CandlestickData[] = json.candles.map((c: any) => ({
            time: c.time, open: c.open, high: c.high, low: c.low, close: c.close
          }));
          candlestickSeries.setData(formatted);
        }
      } catch { setStatus('ALOQA YO\'Q'); }
    };

    const interval = setInterval(fetchData, 2000);
    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current?.clientWidth || 800 });
    window.addEventListener('resize', handleResize);

    return () => { clearInterval(interval); window.removeEventListener('resize', handleResize); chart.remove(); };
  }, []);

  return (
    <div style={{ backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #1e293b', padding: '15px', borderRadius: '12px', marginBottom: '20px', backgroundColor: '#0f172a' }}>
        <h2 style={{ margin: 0 }}>SMC MY MT5: <span style={{ color: '#38bdf8' }}>{data?.symbol || '...'}</span></h2>
        <h3 style={{ margin: 0, color: status === 'ULANGAN' ? '#22c55e' : '#ef4444' }}>● {status}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
          <h4>NARX: {data?.price || '0.00'}</h4>
          <div style={{ background: data?.analysis?.isDiscount ? '#065f46' : '#991b1b', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            {data?.analysis?.isDiscount ? 'BUY ZONE' : 'SELL ZONE'}
          </div>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
          <h4>SMC LEVELS (M15)</h4>
          <p>High: {data?.analysis?.sHigh.toFixed(5)} | Low: {data?.analysis?.sLow.toFixed(5)}</p>
        </div>
      </div>
      <div style={{ border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <div ref={chartContainerRef} />
      </div>
    </div>
  );
}
export default App;