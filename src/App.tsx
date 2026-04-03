import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickData, ISeriesApi } from 'lightweight-charts';

// 1. SMC ANALIZ LOGIKASI
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

    // 2. GRAFIKNI SOZLASH
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: '#020617' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      timeScale: { 
        timeVisible: true,
        borderColor: '#334155',
      },
    });

    // 3. TYPESCRIPT XATOSINI CHEТLAB O'TISH (v5 uchun)
    // @ts-ignore
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = candlestickSeries;

    // 4. MA'LUMOTLARNI PYTHON'DAN OLISH
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-data');
        const json = await response.json();

        if (json.status === 'connected' && json.candles) {
          const analysis = smcLogic(json.candles);
          setData({ ...json, analysis });
          setStatus('ULANGAN');

          const formattedData: CandlestickData[] = json.candles.map((c: any) => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }));

          candlestickSeries.setData(formattedData);
        }
      } catch (error) {
        setStatus('ALOQA YO\'Q');
      }
    };

    const interval = setInterval(fetchData, 2000);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#020617', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #1e293b', padding: '15px', borderRadius: '12px', alignItems: 'center', marginBottom: '20px', backgroundColor: '#0f172a' }}>
        <h2 style={{ margin: 0 }}>SMC MY TERMINAL: <span style={{ color: '#38bdf8' }}>{data?.symbol || 'Bozor kutilmoqda...'}</span></h2>
        <h3 style={{ margin: 0, color: status === 'ULANGAN' ? '#22c55e' : '#ef4444' }}>● {status}</h3>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', borderBottom: `4px solid ${data?.analysis?.isDiscount ? '#22c55e' : '#ef4444'}` }}>
          <h4>NARX: {data?.price || '0.00'}</h4>
          <div style={{ background: data?.analysis?.isDiscount ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: data?.analysis?.isDiscount ? '#22c55e' : '#ef4444', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
            {data?.analysis?.isDiscount ? 'BUY ZONE (CHEGIRMA)' : 'SELL ZONE (PREMIUM)'}
          </div>
        </div>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
          <h4>SMC LEVELS (M15)</h4>
          <p>Swing High: <span style={{ color: '#ef4444', float: 'right' }}>{data?.analysis?.sHigh?.toFixed(5)}</span></p>
          <p>Swing Low: <span style={{ color: '#22c55e', float: 'right' }}>{data?.analysis?.sLow?.toFixed(5)}</span></p>
        </div>
      </div>

      {/* CHART CONTAINER - BU YERDA HECH QANDAY IFRAME YO'Q! */}
      <div style={{ border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
        <div ref={chartContainerRef} style={{ width: '100%' }} />
      </div>

    </div>
  );
}

export default App;