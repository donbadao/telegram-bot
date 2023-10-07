const axios = require('axios');


module.exports = {
    info(msg) {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Hello World từ modules action");
    },
    checkMessage(msg) {
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
    }
}
