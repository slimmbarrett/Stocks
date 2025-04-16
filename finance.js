import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Finance({ userId }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (userId) loadFinance();
  }, [userId]);

  async function loadFinance() {
    const { data } = await supabase.from('sales').select('*').eq('user_id', userId);
    const sum = data.reduce((acc, s) => acc + s.total, 0);
    setTotal(sum);
  }

  return (
    <div>
      <h2 className="font-semibold">📊 Финансовый отчет</h2>
      <p className="text-lg mt-2">💰 Всего продано на: <strong>€{total.toFixed(2)}</strong></p>
    </div>
  );
}
