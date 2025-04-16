import { Telegraf } from 'telegraf';
import { supabase } from '../../lib/supabase';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  await supabase.from('users').upsert({ id: userId });
  const url = `https://t.me/${ctx.me}?startapp=${userId}`;
  ctx.reply(`Привет! Открой WebApp: [Склад бот](${url})`, { parse_mode: 'Markdown' });
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.status(200).end();
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
