import { AbstractMethod }  from './abstract/abstract-method';
import { Message, User } from '../api/api';
import { WriteMarkovMethod } from './write-markov-method';
import { Subject } from 'rxjs';
import {take} from 'rxjs/operators'
import { MarkovGenerateOptions, MarkovConstructorOptions } from '../markov';
import { TelegramBot } from '../telegram-bot';
import { Utils } from '../utils/utils';

export class UserMarkovTextMethod extends AbstractMethod {

    private writeMarkov: WriteMarkovMethod;


    chatMemberSubject: Subject<User> = new Subject();

    constructor(_telegramBot: TelegramBot) {

        super(_telegramBot);
    }

    defaultOptions: MarkovConstructorOptions = {
        stateSize: 1
    };

    options: MarkovGenerateOptions = {
        maxTries: 20,
        randFunc: Math.random,
        filter: (result) => {
            return (/[.!?]$/g).test(result.string)
        }
    }

    process(message: Message) {

        const text = message.text.trim();

        const params = text.split(' ', 2);
        const chatId = message.chat.id;
        console.log(chatId, params)

        this.sendMarkovText(chatId);

    }

    async sendMarkovText(chatId: number) {

        let message = []
        let userList = await this.getChatUsersList(chatId, 100)
        let messages = await this.database.getLastTextByChat(chatId, 100)

        for (const user of userList) {
            const userMessages = messages.filter(val => +val.senderId == +user.id);
            const sentenceArray = userMessages.map(message => {
                return message.text
            });
    
            if (sentenceArray.length <= 2) {
                continue
            }
            
            const markovSentences = Utils.generateUniqueText(sentenceArray, 2, this.defaultOptions, this.options);
            const markovText = markovSentences.map(val => val.string).join(' ');

            message.push(`*${user.first_name}*: ${markovText}\n\n`);
        }
        this.api.sendMessage({
            chat_id: chatId,
            text: message.join(''),
            parse_mode: 'markdown'
        }).subscribe();
    }

    async getChatUsersList(chatId: number, messagesLimit: number): Promise<Array<User>> {

        let userIds = await this.database.getUserIdsFromChat(chatId, messagesLimit)
        let userList = []

        for (const val of userIds) {
                        
            const chatMember = (await this.api.getChatMember({
                chat_id: chatId,
                user_id: val.senderId
            }).pipe(take(1)).toPromise())

            userList.push(chatMember.user)
        }
        
        return userList
    }


}