import TelegramBot from "node-telegram-bot-api";
import {addExpense} from "./commands/addExpense";
import {viewBalance} from "./commands/viewBalance";

const token:string  = process.env.TELEGRAM_TOKEN ?  process.env.TELEGRAM_TOKEN : "";

const bot:TelegramBot = new TelegramBot(token, { polling: true });

// Map bot commands to handlers
bot.onText(/\/start/, (msg) => bot.sendMessage(msg.chat.id, "Welcome to Expense Bot!"));
bot.onText(/\/add/, (msg) => addExpense(bot, msg));
bot.onText(/\/balance/, (msg) => viewBalance(bot, msg));

module.exports = bot;