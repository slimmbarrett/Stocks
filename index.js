import { useEffect, useState } from 'react';
import Inventory from '../components/Inventory';
import Sales from '../components/Sales';
import Finance from '../components/Finance';

export default function Home() {
  const [tab, setTab] = useState('inventory');
  const userId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tgWebAppStartParam') : null;

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold mb-4">📦 Товарный учёт</h1>
      <div className="flex justify-center gap-2 mb-4">
        <button onClick={() => setTab('inventory')} className="px-3 py-1 bg-gray-200 rounded-xl">Склад</button>
        <button onClick={() => setTab('sales')} className="px-3 py-1 bg-gray-200 rounded-xl">Сделки</button>
        <button onClick={() => setTab('finance')} className="px-3 py-1 bg-gray-200 rounded-xl">Финансы</button>
      </div>
      {tab === 'inventory' && <Inventory userId={userId} />}
      {tab === 'sales' && <Sales userId={userId} />}
      {tab === 'finance' && <Finance userId={userId} />}
    </div>
  );
}
