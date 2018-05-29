const weather = require('weather-js');
const {promisify} = require('util');
const sendMessage = require('./send_message');

const fetchWeather = promisify(weather.find);

const getWeather = async (message) => {
    const splitMessage = message.text.split(' ');
    let location = '';
    for (let i = 3; i < splitMessage.length; i += 1) {
        location += `${splitMessage[i]} `;
    }
    location = location.trim();
    const weatherResults = await fetchWeather({search: location, degreeType: 'F'});
    if (!weatherResults.length) {
        await sendMessage({response: 'ye? 🤔', group_id: message.group_id});
    }
    const relevantWeather = weatherResults[0];
    const currentDay = relevantWeather.current.shortday;
    let todayForecast;
    relevantWeather.forecast.forEach((forecast) => {
        if (forecast.shortday === currentDay) {
            todayForecast = forecast;
        }
    });
    const precipString = +todayForecast.high > 35 ? 'rain' : 'snow';
    const returnString = `It is currently ${relevantWeather.current.skytext} and ${relevantWeather.current.temperature} outside in ${relevantWeather.location.name}.
The High today is ${todayForecast.high} and the Low is ${todayForecast.low} with a ${todayForecast.precip} percent chance of ${precipString}`;
    await sendMessage({response: returnString, group_id: message.group_id});
};

module.exports = getWeather;
