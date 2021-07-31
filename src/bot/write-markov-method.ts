import { Utils } from '../utils/utils';
import { AbstractMethod }  from './abstract/abstract-method';
import { Message } from '../api/api';
import { TelegramBot } from '../telegram-bot';
import { DataMessage } from '../model/DataMessage';

export class WriteMarkovMethod extends AbstractMethod {

    constructor(_telegramBot: TelegramBot) {

        super(_telegramBot);

        process.on('SIGINT', (code) => {

            this.database.addMessageToDatabase(this.joinLastMessage());

            console.log(`Exit with code: ${code}`);
            process.exit();
        });
    }
    
    lastMessages: Array<DataMessage> = []

    process(message: Message) {
        
        if (!message.from.id) {
            return;
        }

        const chatId = message.chat.id;
        const lastLenght = this.lastMessages.length
        
        const dataMsg: DataMessage = {
            id: message.message_id,
            senderId: message.from.id,
            chatId: chatId,
            date: message.date,
            text: message.text
        }
        
        if (lastLenght > 0 && this.lastMessages[lastLenght - 1].senderId != dataMsg.senderId) {
            this.database.addMessageToDatabase(this.joinLastMessage())
            this.lastMessages = []
        }
        console.log(chatId, `${message.from.first_name}(${this.lastMessages.length}):`, message.text)  
        
        this.lastMessages.push(dataMsg)
    }


    joinLastMessage(): DataMessage {

        const lastLenght = this.lastMessages.length

        if (lastLenght == 0) {
            return
        }

        let lastMessage = this.lastMessages[lastLenght - 1]
        lastMessage.text = Utils.modifyMessage(this.lastMessages.map(val => val.text).join(' '))

        return lastMessage
    }


    
}