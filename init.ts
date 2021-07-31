import { TelegramBot } from './src/telegram-bot';


//Start bot
try {
    new TelegramBot();
} catch (error) {
    console.error(error)
}

