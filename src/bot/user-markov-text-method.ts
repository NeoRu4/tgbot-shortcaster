import { AbstractMethod }  from './abstract/abstract-method';
import { TelegramBotEmitter } from '../api/emitter';
import { Message, ChatMember, User } from '../api/api';
import { WriteMarkovMethod } from './write-markov-method';
import { Subject } from 'rxjs';
import {bufferTime, filter} from 'rxjs/operators'
import * as fs from 'fs';
import { MarkovGenerateOptions } from '../markov';
import { Utils } from '../utils/utils';
import { MarkovTextMethod } from './markov-text-method';

export class UserMarkovTextMethod extends AbstractMethod {

    private writeMarkov: WriteMarkovMethod;
   
    private readonly DATA_DIR = './database/user/';
    
    chatMemberSubject: Subject<User> = new Subject();

    constructor(_apiEmmiter: TelegramBotEmitter, writeMarkovInstance: WriteMarkovMethod) {

        super(_apiEmmiter);

        this.writeMarkov = writeMarkovInstance;

        this.chatMemberSubject.pipe(
            bufferTime(1000),
            filter(list => !!list.length)
        ).subscribe(chatMemberList => {

            console.log('pushing', chatMemberList);
            this.appendMessageDataFile(chatMemberList);
        });
    }
    
    process(message: Message) {

        const text = message.text.trim();

        if (message.from.username != 'neoflex4') {
            return;
        }

        const params = text.split(' ', 2);
        const chatId = message.chat.id;
        console.log(chatId, params)

        const userName = params[1]?.trim()?.replace('@', '');

        if (!userName) {
            return;
        }

        let user = this.findUser(userName);

        if (!user) {
            this.updateChatUsersList(chatId);

            this.api.sendMessage({
                chat_id: chatId, 
                text: `Пользователь "${userName}" не найден.`,
                parse_mode: 'markdown'
            });

            return;
        }

        this.sendMarkovText(chatId, user);

    }

    sendMarkovText(chatId: number, user: User) {

        const options: MarkovGenerateOptions = {
            maxTries: 25,
            randFunc: Math.random,
            filter: (result) => {
                return (/[.!?]$/g).test(result.string)
              }
        }
        
        let memberMessages = this.writeMarkov.readMessageDataFile(chatId);
        memberMessages = memberMessages.filter(val => val.senderId == user.id);

        let messageFullText = memberMessages.map(message => message.text).join(' ');

        const sentenceArray = Utils.stringToSentenceArray(messageFullText);

        let markovSentences = MarkovTextMethod.generateUniqueText(sentenceArray, 1, options);
        let rngScore = markovSentences.map(val => val.score).reduce((a, b) => a + b, 0 )

        let markovText = markovSentences.map(val => val.string).join(' ');
        markovText += `\n\n*count*: ${memberMessages.length} msgs; ${sentenceArray.length} sentences`;
        markovText += `\n*rng score*: ${rngScore} to ${markovSentences.length} sentences`;
        markovText += `\n*user*: ${user.username} - ${user.first_name || ''} ${user.last_name || ''}`;

        this.api.sendMessage({
            chat_id: chatId, 
            text: markovText,
            parse_mode: 'markdown'
        })
    }

    updateChatUsersList(chatId: number) {

        let userIds = this.writeMarkov.readMessageDataFile(chatId)
            .map(val => val.senderId)
            .filter((value, index, self) => {
                return self.indexOf(value) === index; //Unique 
            });
        
        userIds.forEach(val => {

            this.api.getChatMember({
                chat_id: chatId,
                user_id: val
            }).then((member: ChatMember) => {
                this.chatMemberSubject.next(member.user);
            });
        });
    }

    appendMessageDataFile(includeData: Array<User>) {

        let userData = this.readUserDataFile();
        userData = userData
                .filter(user => 
                    !includeData.find(_user => _user.id == user.id)
                )
                .concat(includeData);

        
        fs.writeFileSync(
            this.fileName, 
            JSON.stringify(userData),
            {flag: 'w+', encoding: 'utf-8'}
        );

        console.log('Write user file');
    }

    findUser(search: string): User {
        return this.readUserDataFile()
            .find(value => {
                return value.username?.startsWith(search) ||
                    value.first_name?.startsWith(search) ||
                    value.last_name?.startsWith(search)
            })
    }

    readUserDataFile(): Array<User> {
        
        try {
            const file = fs.readFileSync(this.fileName, 'utf8');
            return JSON.parse(file);

        } catch (err) {
            return [];
        }
    }

    get fileName(): string {
        let file = this.DATA_DIR + 'chat-users.json';
        file = file.replace(/[\\]/g, '/');
        
        return file
    }
    
}