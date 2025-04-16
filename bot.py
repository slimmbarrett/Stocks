# requirements: python-telegram-bot, supabase

import logging
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CallbackQueryHandler, CommandHandler, ContextTypes, MessageHandler, filters
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Supabase init
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Enable logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# States
STATE = {}

# Start command
def get_main_menu():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🏛️ Склад", callback_data='warehouse')],
        [InlineKeyboardButton("💵 Сделки", callback_data='deals')],
        [InlineKeyboardButton("📊 Финансы", callback_data='finance')],
    ])

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    await update.message.reply_text(f"Привет, {user.first_name}! Выбери действие:", reply_markup=get_main_menu())
    ensure_user_exists(user.id)

def ensure_user_exists(user_id):
    exists = supabase.table("users").select("id").eq("id", user_id).execute()
    if not exists.data:
        supabase.table("users").insert({"id": user_id}).execute()

# Warehouse page
async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id

    if query.data == 'warehouse':
        STATE[user_id] = 'add_item'
        await query.edit_message_text("Введите товар в формате: Название, Кол-во, Цена")

    elif query.data == 'deals':
        STATE[user_id] = 'add_deal'
        await query.edit_message_text("Введите продажу в формате: Название, Кол-во")

    elif query.data == 'finance':
        sales = supabase.table("sales").select("*", count='exact').eq("user_id", user_id).execute()
        products = supabase.table("products").select("*", count='exact').eq("user_id", user_id).execute()
        total_earned = sum([s['amount'] * s['price'] for s in sales.data])
        await query.edit_message_text(f"Всего продаж: {sales.count}\nДоход: {total_earned} EUR\nОстаток товаров: {products.count}")

async def text_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    text = update.message.text

    if STATE.get(user_id) == 'add_item':
        try:
            name, qty, price = map(str.strip, text.split(","))
            supabase.table("products").insert({
                "user_id": user_id,
                "name": name,
                "quantity": int(qty),
                "price": float(price),
            }).execute()
            await update.message.reply_text("✅ Товар добавлен!", reply_markup=get_main_menu())
        except:
            await update.message.reply_text("❌ Ошибка. Используй формат: Название, Кол-во, Цена")

    elif STATE.get(user_id) == 'add_deal':
        try:
            name, qty = map(str.strip, text.split(","))
            qty = int(qty)
            product = supabase.table("products").select("*").eq("user_id", user_id).eq("name", name).single().execute()
            if product.data and product.data['quantity'] >= qty:
                new_qty = product.data['quantity'] - qty
                supabase.table("products").update({"quantity": new_qty}).eq("id", product.data['id']).execute()
                supabase.table("sales").insert({
                    "user_id": user_id,
                    "product_id": product.data['id'],
                    "amount": qty,
                    "price": product.data['price'],
                }).execute()
                await update.message.reply_text("✅ Продажа сохранена!", reply_markup=get_main_menu())
            else:
                await update.message.reply_text("❌ Недостаточно товара на складе")
        except:
            await update.message.reply_text("❌ Ошибка. Используй формат: Название, Кол-во")

    STATE[user_id] = None

# Main function
def main():
    app = Application.builder().token(os.getenv("BOT_TOKEN")).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(handle_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))
    app.run_polling()

if __name__ == '__main__':
    main()
