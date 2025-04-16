import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Sales({ userId }) {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({ name: '', quantity: '' });

  useEffect(() => {
    if (userId) loadSales();
  }, [userId]);

  async function loadSales() {
    const { data } = await supabase.from('sales').select('*').eq('user_id', userId);
    setSales(data);
  }

  async function sellItem() {
    const { data: items } = await supabase.from('inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('name', form.name);
    const item = items[0];
    if (!item || item.quantity < +form.quantity) return alert('Недостаточно товара');

    const newQty = item.quantity - +form.quantity;
    const total = +form.quantity * item.price;

    await supabase.from('inventory').update({ quantity: newQty }).eq('id', item.id);
    await supabase.from('sales').insert({ user_id: userId, item: form.name, quantity: +form.quantity, total });

    setForm({ name: '', quantity: '' });
    loadSales();
  }

  return (
    <div>
      <h2 className="font-semibold mb-2">Совершить сделку</h2>
      <input placeholder="Товар" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-1 mr-1"/>
      <input placeholder="Кол-во" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="border p-1 mr-1"/>
      <button onClick={sellItem} className="bg-green-500 text-white px-2 py-1 rounded">Продать</button>
      <div className="mt-4">
        <h3 className="font-medium">История сделок:</h3>
        {sales.map(s => (
          <div key={s.id} className="mt-1">🛒 {s.item} – {s.quantity}шт | €{s.total}</div>
        ))}
      </div>
    </div>
  );
}
