const TelegramBot = require('node-telegram-bot-api');
const token = '6683681793:AAEtk8pBXlpHfqofpjDVKEvkzfhQQjYjlGo';
const bot = new TelegramBot(token, { polling: true });
const action = new require("./modules/actions.js");

bot.onText(/\/hello/, (msg) => {
    action.info(msg);
});

bot.on('message', (msg) => {
    action.checkMessage(msg);
});