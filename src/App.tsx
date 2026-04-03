import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { 
  TrendingUp, 
  BookOpen, 
  Zap, 
  ShieldCheck, 
  Layers, 
  BarChart3, 
  Info,
  ChevronRight,
  Target,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SMC_DATABASE, SMCConcept } from './types';
import { generateMockData, analyzeSMC } from './utils/smcEngine';
import { cn } from './lib/utils';

const TradingChart = ({ data, annotations }: { data: any[], annotations: any[] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    }) as any;

    candlestickSeries.setData(data.map(d => ({
      time: Math.floor(new Date(d.time).getTime() / 1000), // Sanani soniyaga o'tkazamiz
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close
    })));

    // Add markers for BOS/CHoCH
   candlestickSeries.setMarkers(annotations.map(a => ({
      time: Math.floor(new Date(a.time).getTime() / 1000), // Bu yerda ham soniyaga o'tkazamiz
      position: a.type === 'BOS' ? 'aboveBar' : 'belowBar',
      color: a.color,
      shape: 'arrowUp', // yoki o'zingizda bor shape nomi
      text: a.type
   })));

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, annotations]);

  return <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden border border-white/10" />;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'education' | 'signals'>('dashboard');
  const [selectedConcept, setSelectedConcept] = useState<SMCConcept | null>(null);
  const [priceData] = useState(generateMockData(150));
  const [smcAnalysis] = useState(analyzeSMC(priceData));

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SMC Master <span className="text-blue-500">Bot</span></span>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            {(['dashboard', 'education', 'signals'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize",
                  activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-400 hover:text-white"
                )}
              >
                {tab === 'dashboard' ? 'Asosiy' : tab === 'education' ? 'Bilimlar' : 'Signallar'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-500">Live Market</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Trend', value: 'Bullish', icon: TrendingUp, color: 'text-green-500' },
                  { label: 'Market State', value: 'Expansion', icon: Activity, color: 'text-blue-500' },
                  { label: 'POI Proximity', value: 'High', icon: Target, color: 'text-orange-500' },
                  { label: 'Liquidity', value: 'Cleared', icon: Zap, color: 'text-yellow-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</span>
                      <stat.icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                    <div className="text-xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        SMC Strukturaviy Tahlil
                      </h2>
                      <div className="flex gap-2">
                        {['15m', '1H', '4H', '1D'].map(tf => (
                          <button key={tf} className={cn(
                            "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                            tf === '15m' ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                          )}>
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                    <TradingChart data={priceData} annotations={smcAnalysis} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl h-full">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Oxirgi Voqealar
                    </h2>
                    <div className="space-y-4">
                      {smcAnalysis.slice(-6).reverse().map((event, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            event.type === 'BOS' ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"
                          )}>
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold">{event.type} Aniqladi</div>
                            <div className="text-xs text-gray-500">Narx: {event.price.toFixed(4)}</div>
                            <div className="text-[10px] text-gray-600 mt-1 uppercase">{event.time}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-700 ml-auto group-hover:text-gray-400 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'education' && (
            <motion.div
              key="education"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-1 space-y-4">
                <h2 className="text-2xl font-bold mb-6">SMC Kutubxonasi</h2>
                {SMC_DATABASE.map((concept) => (
                  <button
                    key={concept.id}
                    onClick={() => setSelectedConcept(concept)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                      selectedConcept?.id === concept.id 
                        ? "bg-blue-600 border-blue-500 text-white" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        selectedConcept?.id === concept.id ? "bg-white/20" : "bg-white/5"
                      )}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold">{concept.title}</div>
                        <div className="text-xs opacity-60">{concept.category}</div>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-transform",
                      selectedConcept?.id === concept.id ? "rotate-90" : ""
                    )} />
                  </button>
                ))}
              </div>

              <div className="md:col-span-2">
                {selectedConcept ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-3xl sticky top-24"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                        <Info className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold">{selectedConcept.title}</h3>
                        <span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-xs font-bold uppercase tracking-widest">
                          {selectedConcept.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <p className="text-xl text-gray-300 leading-relaxed mb-6">
                        {selectedConcept.description}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                        <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                          <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Qachon ishlatiladi?
                          </h4>
                          <p className="text-sm text-gray-400">
                            Bozor tuzilishi o'zgarganda va institutlar iz qoldirganda ushbu konseptsiya asosida kirish nuqtasi qidiriladi.
                          </p>
                        </div>
                        <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                          <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Muhim maslahat
                          </h4>
                          <p className="text-sm text-gray-400">
                            Hech qachon bitta konseptsiya bilan savdo qilmang. Har doim HTF (High Timeframe) tahlilini LTF bilan tasdiqlang.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-3xl p-12">
                    <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Batafsil ma'lumot olish uchun chapdan mavzuni tanlang</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'signals' && (
            <motion.div
              key="signals"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Avtomatik Signallar</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Oxirgi yangilanish: Hozirgina
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { pair: 'EUR/USD', type: 'BUY', price: '1.0845', target: '1.0920', sl: '1.0810', strength: 'High', reason: 'Order Block + FVG' },
                  { pair: 'GBP/USD', type: 'SELL', price: '1.2650', target: '1.2540', sl: '1.2690', strength: 'Medium', reason: 'CHoCH + Premium' },
                  { pair: 'BTC/USDT', type: 'BUY', price: '64200', target: '68500', sl: '63100', strength: 'High', reason: 'BOS + Discount' },
                ].map((signal, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
                    <div className={cn(
                      "p-4 flex items-center justify-between",
                      signal.type === 'BUY' ? "bg-green-500/10" : "bg-red-500/10"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                          signal.type === 'BUY' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        )}>
                          {signal.type === 'BUY' ? 'B' : 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{signal.pair}</div>
                          <div className="text-[10px] uppercase tracking-widest opacity-60">{signal.reason}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 font-medium">Strength</div>
                        <div className={cn(
                          "text-sm font-bold",
                          signal.strength === 'High' ? "text-green-500" : "text-yellow-500"
                        )}>{signal.strength}</div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Entry Price</div>
                          <div className="font-mono text-lg">{signal.price}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-gray-500 uppercase font-bold">Take Profit</div>
                          <div className="font-mono text-lg text-blue-400">{signal.target}</div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-red-500/80 uppercase">Stop Loss</span>
                        <span className="font-mono font-bold text-red-500">{signal.sl}</span>
                      </div>

                      <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white">
                        Tahlilni Ko'rish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-12 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-400">Professional SMC Trading Engine v1.0</span>
          </div>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Ushbu robot faqat tahliliy maqsadlar uchun mo'ljallangan. Savdo qilishdan oldin o'z tahlilingizni o'tkazing.
          </p>
        </div>
      </footer>
    </div>
  );
}
