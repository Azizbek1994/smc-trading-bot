export interface SMCConcept {
  id: string;
  title: string;
  description: string;
  category: 'Structure' | 'Liquidity' | 'SupplyDemand' | 'Execution';
}

export const SMC_DATABASE: SMCConcept[] = [
  {
    id: 'premium-discount',
    title: 'Premium va Discount',
    description: 'Narxning diapazondagi holati. Premium (qimmat) - sotish uchun, Discount (arzon) - sotib olish uchun.',
    category: 'Execution'
  },
  {
    id: 'poi',
    title: 'POI (Point of Interest)',
    description: 'Qiziqish nuqtasi. Narx qaytishi kutilayotgan hudud (Order Block, FVG, Breaker).',
    category: 'SupplyDemand'
  },
  {
    id: 'bos',
    title: 'BOS (Break of Structure)',
    description: 'Trend davom etishini bildiruvchi tuzilish buzilishi.',
    category: 'Structure'
  },
  {
    id: 'choch',
    title: 'CHoCH (Change of Character)',
    description: 'Trend o\'zgarishining birinchi belgisi.',
    category: 'Structure'
  },
  {
    id: 'fvg',
    title: 'FVG (Fair Value Gap)',
    description: 'Narxdagi nomutanosiblik (Imbalance). Narx ko\'pincha bu bo\'shliqni to\'ldirishga qaytadi.',
    category: 'SupplyDemand'
  },
  {
    id: 'order-block',
    title: 'Order Block',
    description: 'Yirik institutlar o\'z buyurtmalarini joylashtirgan oxirgi qarama-qarshi sham.',
    category: 'SupplyDemand'
  },
  {
    id: 'liquidity',
    title: 'Likvidlik',
    description: 'Stop-loss buyurtmalari to\'plangan hududlar (EQH, EQL, Trendline).',
    category: 'Liquidity'
  }
];

export interface PriceData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SMCAnnotation {
  type: 'BOS' | 'CHoCH' | 'FVG' | 'OB';
  price: number;
  time: string;
  label: string;
  color: string;
}
