import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { analyzeSMC } from './utils/smcEngine';

export const TradingChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const [liveData, setLiveData] = useState<any[]>([]);

  // 1. Python Serverdan har 1 soniyada ma'lumot olish
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-data');
        if (!response.ok) throw new Error('Server xatosi');
        const data = await response.json();
        if (Array.isArray(data)) setLiveData(data);
      } catch (err) {
        console.error("Ulanish uzildi:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); // 1 SONIYA
    return () => clearInterval(interval);
  }, []);

  // 2. Grafikni chizish mantiqi
  useEffect(() => {
    if (!chartContainerRef.current || liveData.length === 0) return;

    // Grafikni faqat bir marta yaratish (har soniyada o'chirib yoqmaslik uchun)
    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        layout: { background: { type: ColorType.Solid, color: '#0b0e11' }, textColor: '#d1d4dc' },
        width: chartContainerRef.current.clientWidth,
        height: 600,
        timeScale: { timeVisible: true, secondsVisible: true },
      });

      candleSeriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
        wickUpColor: '#26a69a', wickDownColor: '#ef5350',
      });
    }

    const sortedData = [...liveData].sort((a, b) => a.time - b.time);
    candleSeriesRef.current.setData(sortedData);

    // SMC Signallarini yangilash
    // Eslatma: Signallar ko'payib ketmasligi uchun har safar grafikni tozalash kerak bo'lishi mumkin
    // Hozircha oddiy holatda qoldiramiz

    return () => {
      // Komponent o'chganda grafikni tozalash
      if (chartRef.current) {
        // chartRef.current.remove(); // Bu qatorni faqat butunlay chiqib ketganda ishlating
      }
    };
  }, [liveData]);

  return (
    <div style={{ backgroundColor: '#0b0e11', minHeight: '100vh', padding: '20px', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', border: '1px solid #363c4e', borderRadius: '10px' }}>
        <div style={{ padding: '15px', background: '#161b22', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, color: '#26a69a' }}>SMC ULTRA-LIVE: XAUUSD (M1)</h3>
          <span style={{ color: liveData.length > 0 ? '#26a69a' : '#ef5350' }}>
            ● {liveData.length > 0 ? 'LIVE STREAMING' : 'DISCONNECTED'}
          </span>
        </div>
        <div ref={chartContainerRef} />
      </div>
    </div>
  );
};

export default TradingChart;