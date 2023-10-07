const axios = require('axios');
const moment = require('moment');
module.exports = {
    helloWorld(chatID, bot) {
        bot.sendMessage(chatID, "Hello World từ modules action");
    },
    weather(chatID, bot) {
        let result = null;
        let localtion = 'Soc Trang';
        let ApiKey = 'c34d0b30de706ed953190741dcd852f2';
        let urlAPI = `https://api.openweathermap.org/data/2.5/weather?q=${localtion}&appid=${ApiKey}&lang=vi&units=metric`;
        
        axios.get(urlAPI)
            .then(response => {
                let dataResult = response.data;
                if (dataResult.cod == 404) {
                    result = dataResult.message;
                    bot.sendMessage(chatID, result);
                }
                result = `Thời tiết hiện tại của tỉnh ${localtion}
          \n Thời tiết: ${dataResult.weather[0].description}
          \n Nhiệt độ: ${Math.round(dataResult.main.temp)} độ C
          \n Độ ẩm: ${dataResult.main.humidity}%
          \n Sức gió: ${((dataResult.wind.speed) * 3.6).toFixed(2)} m/s
          \n Mặt trời lặn: ${moment.unix(dataResult.sys.sunset).format("H:mm")}`;
                bot.sendMessage(chatID, result);
            });
    }
    
}