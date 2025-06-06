//rik.fan - chia sẻ học hỏi
const TeleBot = require('telebot');
const bot = new TeleBot('5670696238:AAF8Chv1DoYAHfDR2PrWZYybO1OKyWY4zeE');
let configDB = require('../config/database');
let mongoose = require('mongoose');

require('mongoose-long')(mongoose); // INT 64bit
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(configDB.url, configDB.options)
    .catch(function(error) {
        if (error)
            console.log('Connect to MongoDB failed', error);
        else
            console.log('Connect to MongoDB success');
    });
bot.start();
require('./Controllers/start')(bot)
require('./Controllers/contact')(bot)
require('./Controllers/otp')