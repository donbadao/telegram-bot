const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2');
const axios = require('axios');
const moment = require('moment');

// Tạo kết nối đến cơ sở dữ liệu
const connection = mysql.createConnection({
    host: 'localhost', // Thay thế bằng địa chỉ máy chủ MySQL của bạn
    user: 'root', // Thay thế bằng tên người dùng MySQL của bạn
    password: '', // Thay thế bằng mật khẩu MySQL của bạn
    database: 'econtractv2' // Thay thế bằng tên cơ sở dữ liệu của bạn
    // port: 3306,
    // host: '103.138.88.56', // Thay thế bằng địa chỉ máy chủ MySQL của bạn
    // user: 'grv39505_econtract', // Thay thế bằng tên người dùng MySQL của bạn
    // password: 'Ftp@huule@vnpt.vn', // Thay thế bằng mật khẩu MySQL của bạn
    // database: 'grv39505_econtract' // Thay thế bằng tên cơ sở dữ liệu của bạn  
});

// Kết nối đến cơ sở dữ liệu
connection.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối đến cơ sở dữ liệu: ' + err.stack);
        return;
    }
    console.log('Đã kết nối đến cơ sở dữ liệu MySQL với ID ' + connection.threadId);
});

// Thay đổi dòng sau với mã token mà bạn đã nhận từ BotFather
const token = '6683681793:AAEtk8pBXlpHfqofpjDVKEvkzfhQQjYjlGo';

// Khởi tạo bot
const bot = new TelegramBot(token, { polling: true });

const companyData = [];
const itemsPerPage = 10;
let currentPage = 1;

const badWordsList = ['chó', 'dmcs', 'phản động'];

bot.onText(/\/companies/, (msg) => {
    getCompanies(msg);
});

bot.on('message', (msg) => {
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
        bot.sendMessage(chatId, replyText, { reply_to_message_id: messageId,parse_mode: 'Markdown' });
    }
});



bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'button1') {
        currentPage = Math.max(1, currentPage - 1);
        getCompanies(callbackQuery.message);
    } else if (data === 'button2') {
        currentPage++;
        getCompanies(callbackQuery.message);
    }

});

function getCompanies(msg) {
    const chatId = msg.chat.id;
    const offset = (currentPage - 1) * itemsPerPage;
    const query = `SELECT company_id,company_name,company_taxcode,company_address,company_owner FROM companies ORDER BY company_id desc limit ${offset},${itemsPerPage}`;

    let response = null;
    connection.query(query, (err, results) => {
        const companies = results;
        for (let i = 0; i < itemsPerPage; i++) {
            response += `\n-Tên công ty : ${companies[i].company_name}
            \n-Mã số thuế: ${companies[i].company_taxcode}
                        \n-Địa chỉ: ${companies[i].company_address}\n
                        \n-Người đại diện: ${companies[i].company_owner}`;
        }
        const keyboard = {
            inline_keyboard: [
                [{ text: 'Trang trước', callback_data: 'button1' }],
                [{ text: 'Trang sau', callback_data: 'button2' }],
            ],
        };
        bot.sendMessage(chatId, response, { reply_markup: keyboard });
    });
}

bot.onText(/\/weather/, (msg) => {
    const chatId = msg.chat.id;
    let result = null;

    let localtion = 'Soc Trang';



    let ApiKey = 'c34d0b30de706ed953190741dcd852f2';
    let urlAPI = `https://api.openweathermap.org/data/2.5/weather?q=${localtion}&appid=${ApiKey}&lang=vi&units=metric`;

    axios.get(urlAPI)
        .then(response => {
            let dataResult = response.data;
            if (dataResult.cod == 404) {
                result = respodataResult.message;
                bot.sendMessage(chatId, result);
            }
            result = `Thời tiết hiện tại của tỉnh ${localtion}
      \n Thời tiết: ${dataResult.weather[0].description}
      \n Nhiệt độ: ${Math.round(dataResult.main.temp)} độ C
      \n Độ ẩm: ${dataResult.main.humidity}%
      \n Sức gió: ${((dataResult.wind.speed) * 3.6).toFixed(2)} m/s
      \n Mặt trời lặn: ${moment.unix(dataResult.sys.sunset).format("H:mm")}`;
            bot.sendMessage(chatId, result);
        });
});

// bot.onText(/\/g5r/, (msg) => {
//     const chatId = msg.chat.id;
//     connection.query('SELECT * FROM user', (err, results) => {
//         if (err) {
//             console.error('Lỗi truy vấn cơ sở dữ liệu: ' + err);
//             bot.sendMessage(chatId, 'Có lỗi xảy ra khi lấy dữ liệu từ cơ sở dữ liệu.');
//             return;
//         }

//         // Xử lý dữ liệu và gửi kết quả về cho người dùng
//         const users = results;
//         let response = 'Danh sách tài khoản:\n';
//         for (let i = 0; i < users.length; i++) {
//             response += `Tên tài khoản : ${users[i].user_name}
//             \n Tên hiển thị: ${users[i].user_fullname}`;
//         }
//         bot.sendMessage(chatId, response);
//     });

//     // Gửi tin nhắn với nút menu

// });


// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     const keyboard = {
//         inline_keyboard: [
//             [{ text: 'Nút 1', callback_data: 'button1' }],
//             [{ text: 'Nút 2', callback_data: 'button2' }],
//             // Các nút khác có thể được thêm vào đây
//         ],
//     };

//     // Gửi tin nhắn với nút menu
//     bot.sendMessage(chatId, 'Chọn một nút:', { reply_markup: keyboard });
// });


// bot.onText(/\/weather/, (msg) => {
//     const chatId = msg.chat.id;
//     let result = 'Thời tiết';
//     let localtion = 'Soc Trang';

//     let ApiKey = 'c34d0b30de706ed953190741dcd852f2';
//     let urlAPI = `https://api.openweathermap.org/data/2.5/weather?q=${localtion}&appid=${ApiKey}&lang=vi&units=metric`;

//     axios.get(urlAPI)
//         .then(response => {
//             let dataResult = response.data;
//             result = `Thời tiết hiện tại của tỉnh ${localtion}
//       \n Thời tiết: ${dataResult.weather[0].description}
//       \n Nhiệt độ: ${Math.round(dataResult.main.temp)} độ C
//       \n Độ ẩm: ${dataResult.main.humidity}%
//       \n Sức gió: ${((dataResult.wind.speed) * 3.6).toFixed(2)} m/s
//       \n Mặt trời lặn: ${moment.unix(dataResult.sys.sunset).format("H:mm")}`;
//             bot.sendMessage(chatId, result);
//         });
//     // response = `Thời tiết tại ${localtion} hiện tại
//     // \n - Nhiệt độ : ${urlAPI.weather.description}`

//     // Gửi tin nhắn với nút menu

// });


// bot.onText(/\/companies/, (msg) => {
//     const chatId = msg.chat.id;

//     connection.query('SELECT * FROM companies', (err, results) => {
//         if (err) {
//             console.error('Lỗi truy vấn cơ sở dữ liệu: ' + err);
//             bot.sendMessage(chatId, 'Có lỗi xảy ra khi lấy dữ liệu từ cơ sở dữ liệu.');
//             return;
//         }

//         // Xử lý dữ liệu và gửi kết quả về cho người dùng
//         const companies = results;
//         let response = 'Danh sách công ty:\n';

//         for (let i = 0; i < itemsPerPage; i++) {
//             response +=
//                 `- Tên Công Ty: ${companies[i].company_name.trim()}
//                 \n- Mã số thuế: ${companies[i].company_taxcode.trim()}
//             \n- Địa chỉ: ${companies[i].company_address.trim()}`;
//         }
//         bot.sendMessage(chatId, response);
//     });
//     connection.end((err) => {
//         if (err) {
//             console.error('Lỗi khi đóng kết nối: ' + err);
//         }
//     });

// });

// bot.onText(/\/info/, (msg) => {
//     const chatId = msg.chat.id;
//     let text = "Nguyễn Hữu Lễ";
//     bot.sendMessage(chatId, text);
// });

// bot.onText(/\/company (.+)/, (msg, match) => {
//     const chatId = msg.chat.id;
//     const taxCode = match[1];

//     // Truy vấn SQL với truy vấn tham số và trích xuất an toàn
//     const query = 'SELECT * FROM companies WHERE company_taxcode = ?';
//     connection.query(query, [taxCode], (err, results) => {
//         if (err) {
//             console.error('Lỗi truy vấn cơ sở dữ liệu: ' + err);
//             bot.sendMessage(chatId, 'Có lỗi xảy ra khi lấy dữ liệu từ cơ sở dữ liệu.');
//             return;
//         }

//         if (results.length > 0) {
//             const company = results[0];
//             bot.sendMessage(chatId,
//                 `Thông tin công ty:\nTên: ${company.company_name}
//                 \nMã số thuế: ${company.company_taxcode}
//                 \nSố điện thoại: ${company.company_phone} - ${company.company_telephone}
//                 \nĐịa chỉ: ${company.company_address}
//                 \nNgười đại diện: ${company.company_owner}
//                 \nChức vụ: ${company.company_position}`
//             );
//         } else {

//             bot.sendMessage(chatId, 'Không tìm thấy thông tin cho mã số thuế này.');
//         }
//     });
// });



// bot.onText(/\/companybyname (.+)/, (msg, match) => {
//     const chatId = msg.chat.id;
//     const taxCode = match[1];

//     // Truy vấn SQL với truy vấn tham số và trích xuất an toàn
//     const query = 'SELECT * FROM companies WHERE company_name like %?';
//     connection.query(query, [taxCode], (err, results) => {
//         if (err) {
//             console.error('Lỗi truy vấn cơ sở dữ liệu: ' + err);
//             bot.sendMessage(chatId, 'Có lỗi xảy ra khi lấy dữ liệu từ cơ sở dữ liệu.');
//             return;
//         }

//         if (results.length > 0) {
//             const company = results[0];
//             bot.sendMessage(chatId,
//                 `Thông tin công ty:\nTên: ${company.company_name}
//                 \nMã số thuế: ${company.company_taxcode}
//                 \nSố điện thoại: ${company.company_phone} - ${company.company_telephone}
//                 \nĐịa chỉ: ${company.company_address}
//                 \nNgười đại diện: ${company.company_owner}
//                 \nChức vụ: ${company.company_position}`
//             );
//         } else {
//             // Không tìm thấy dữ liệu
//             bot.sendMessage(chatId, 'Không tìm thấy thông tin cho mã số thuế này.');
//         }
//     });
// });

// function getCompanies(chatId, page) {

// }

// function sendCompanyData(chatId, page) {
//     const startIdx = (page - 1) * itemsPerPage;
//     const endIdx = startIdx + itemsPerPage;
//     const pageData = companyData.slice(startIdx, endIdx);

//     // Tạo tin nhắn với danh sách công ty trên trang hiện tại
//     const message = `Danh sách công ty (Trang ${page}):\n${pageData.join('\n')}`;

//     // Tạo nút "Trang trước" và "Trang tiếp theo" để chuyển đổi trang
//     const keyboard = {
//         inline_keyboard: [
//             [
//                 { text: 'Trang trước', callback_data: `prevPage:${page}` },
//                 { text: 'Trang tiếp theo', callback_data: `nextPage:${page}` },
//             ],
//         ],
//     };

//     // Gửi tin nhắn với nút
//     bot.sendMessage(chatId, message, { reply_markup: keyboard });
// }

// bot.on('callback_query', (query) => {
//     const chatId = query.message.chat.id;
//     const data = query.data.split(':');
//     const action = data[0];
//     const currentPage = parseInt(data[1]);

//     if (action === 'prevPage' && currentPage > 1) {
//         sendCompanyData(chatId, currentPage - 1);
//     } else if (action === 'nextPage' && currentPage < Math.ceil(companyData.length / itemsPerPage)) {
//         sendCompanyData(chatId, currentPage + 1);
//     }
// });





