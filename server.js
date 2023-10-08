const TelegramBot = require('node-telegram-bot-api');
const token = '6506614832:AAGwXgk0w8Hn2iNiyvtEy63Av19qBQ8rmXM';
const bot = new TelegramBot(token, { polling: true });
const axios = require('axios');

bot.onText(/\/hello/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Hello World từ modules action");
});

bot.onText(/\/companies/, (msg => {
    const chatID = msg.chat.id;
    let result = "";
    axios.get('https://econtract-app.000webhostapp.com/econtract/index.php').then(response => {
        let companies = response;
        for (let i = 0; i < 10; i++) {
            result += `\n-Tên công ty : ${companies[i].company_name}
            \n-Mã số thuế: ${companies[i].company_taxcode}
                        \n-Địa chỉ: ${companies[i].company_address}
                        \n-Người đại diện: ${companies[i].company_owner}
                        \n------------------------------------------------------------------------------------------`;
        }
    });
    bot.sendMessage(chatID, result);
}));

bot.on('message', (msg) => {
    const badWordsList = ['chó', 'dmcs', 'phản động', 'cc'];
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const text = msg.text;
    // Chuyển tiếp toàn bộ tin nhắn đến USER_ID_DESTINATION
    // bot.forwardMessage(chatId, chatId, msg.message_id); // Chuyển tiếp tin nhắn

    const pattern = /^Trợ giúp:\s*(.+)$/;
    const match = text.match(pattern);
    if (match) {
        const userName = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`;
        const replyText = `[${userName}](tg://user?id=${msg.from.id}): Hệ thống đã ghi nhận yêu cầu của bạn`;
        bot.sendMessage(chatId, replyText, { reply_to_message_id: messageId, parse_mode: 'Markdown' });
    }

    const containsBadWord = badWordsList.some(word => text.toLowerCase().includes(word.toLowerCase()));

    if (containsBadWord) {
        const userName = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`;
        const replyText = `[${userName}](tg://user?id=${msg.from.id}): Nội dung của bạn chứa từ ngữ không mong muốn. Vui lòng không sử dụng những từ này.`;
        bot.sendMessage(chatId, replyText, { reply_to_message_id: messageId, parse_mode: 'Markdown' });
    }
});