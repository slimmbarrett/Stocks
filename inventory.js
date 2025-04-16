import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Inventory({ userId }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', quantity: '', price: '' });

  useEffect(() => {
    if (userId) loadItems();
  }, [userId]);

  async function loadItems() {
    const { data } = await supabase.from('inventory').select('*').eq('user_id', userId);
    setItems(data);
  }

  async function addItem() {
    await supabase.from('inventory').insert({
      user_id: userId,
      name: form.name,
      quantity: +form.quantity,
      price: +form.price
    });
    setForm({ name: '', quantity: '', price: '' });
    loadItems();
  }

  return (
    <div>
      <h2 className="font-semibold mb-2">Добавить товар</h2>
      <input placeholder="Название" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-1 mr-1"/>
      <input placeholder="Кол-во" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="border p-1 mr-1"/>
      <input placeholder="Цена" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="border p-1 mr-1"/>
      <button onClick={addItem} className="bg-blue-500 text-white px-2 py-1 rounded">Добавить</button>
      <div className="mt-4">
        <h3 className="font-medium">Товары на складе:</h3>
        {items.map(i => (
          <div key={i.id} className="mt-1">🧺 {i.name}: {i.quantity}шт – €{i.price}</div>
        ))}
      </div>
    </div>
  );
}
