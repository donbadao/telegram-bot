const TelegramBot = require('node-telegram-bot-api');
const token = '6683681793:AAEtk8pBXlpHfqofpjDVKEvkzfhQQjYjlGo';
const bot = new TelegramBot(token, { polling: true });


bot.onText(/\/hello/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatID, "Hello World từ modules action");
});