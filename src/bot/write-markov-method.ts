import * as fs from 'fs';
import { Utils } from '../utils/utils';
import { AbstractMethod }  from './abstract/abstract-method';
import { TelegramBotEmitter } from '../api/emitter';
import { Message } from '../api/api';

export interface DataMessage {
    id: number;
    senderId: number;
    // chatId: number;
    // date: number;
    text: string;
}

export class WriteMarkovMethod extends AbstractMethod {

    private readonly BATCH_SIZE = 10;
    private readonly DATA_DIR = './database/';
    private messages: Map<number, Array<DataMessage>> = new Map();

    constructor(_apiEmmiter: TelegramBotEmitter) {

        super(_apiEmmiter);

        process.on('SIGINT', (code) => {

            const chatIds = Array.from(this.messages.keys());

            chatIds.forEach(chatId => {
                this.appendMessageDataFile(chatId, this.messages.get(chatId));
            });

            console.log(`Exit with code: ${code}`);
            process.exit();
        });
    }
    
    process(message: Message) {

        if (!message.from.id) {
            return;
        }

        console.log(message.chat.id, message.from.first_name + ':', message.text)

        const chatId = message.chat.id;
        const dataMsg: DataMessage = {
            id: message.message_id,
            senderId: message.from.id,
            // chatId: chatId,
            // date: message.date,
            text: Utils.modifyMessage(message.text)
        }


        let currentChatMessages = this.messages.get(chatId) || [];
        currentChatMessages.push(dataMsg)
        this.messages.set(chatId, currentChatMessages);

        if (currentChatMessages.length >= this.BATCH_SIZE) {

            this.appendMessageDataFile(chatId, currentChatMessages);
            this.messages.set(chatId, []);
        }
    }


    appendMessageDataFile(chatId: number, chatMsgs: Array<DataMessage>) {

        let msgs = this.readMessageDataFile(chatId);
        msgs = msgs
                .filter(msg => !chatMsgs.find(incMsg => msg.id == incMsg.id))
                .concat(chatMsgs);

        
        fs.writeFileSync(
            this.fileName(chatId), 
            JSON.stringify(msgs),
            {flag: 'w+', encoding: 'utf-8'}
        );

        console.log('Write file chat:', chatId);
    }


    readMessageDataFile(chatId: number): Array<DataMessage> {
        
        try {
            const file = fs.readFileSync(this.fileName(chatId), 'utf8');
            return JSON.parse(file);

        } catch (err) {
            return [];
        }
    }

    fileName(chatId:number) {
        let file = this.DATA_DIR + 'chat' + chatId + '.json';
        file = file.replace(/[\\]/g, '/');
        
        return file
    }
    
}