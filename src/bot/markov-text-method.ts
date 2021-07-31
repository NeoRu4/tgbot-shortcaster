import { Markov, MarkovGenerateOptions, MarkovResult, MarkovConstructorOptions } from '../markov';
import { Utils } from '../utils/utils';
import { AbstractMethod }  from './abstract/abstract-method';
import { Message } from '../api/api';
import { TelegramBot } from '../telegram-bot';

export class MarkovTextMethod extends AbstractMethod {


    constructor(_telegramBot: TelegramBot) {

        super(_telegramBot);
    }

    defaultOptions: MarkovConstructorOptions = {
        stateSize: 1
    };

    personalOptions: MarkovConstructorOptions = {
        stateSize: 1
    };

    generateOptions: MarkovGenerateOptions = {
        maxTries: 25,
        randFunc: Math.random,
        filter: (result) => {
            return (/[.!?]$/g).test(result.string)
          }
    }

    process(message: Message) {

        const text = message.text.trim();

        const params = text.split(' ');
        const chatId = message.chat.id;
        console.log(chatId, params)

        if (message.reply_to_message) {
            this.sendReplyMarkovText(message);
            return;
        }

        this.sendMarkovText(
            chatId,
            +params[1] || 4,
            +params[2] || 100
        );
    }


    sendReplyMarkovText(message: Message) {

        let chatId = message.chat.id;
        let replyText = Utils.modifyMessage(message.reply_to_message.text);

        if (!replyText) {
            return;
        }

        let replyArray = Utils.stringToSentenceArray(replyText);

        let sentenceCount = Math.floor(replyArray.length / 2);

        let markovSentences = Utils.generateUniqueText(replyArray, sentenceCount, this.personalOptions, this.generateOptions);

        let rngScore = markovSentences.map(val => val.score).reduce((a, b) => a + b, 0 )

        let markovText = markovSentences.map(val => val.string).join(' ') +
                         `\n\n*rng score*: ${rngScore} to ${markovSentences.length} sentences`;

        this.api.sendMessage({
            chat_id: chatId,
            text: markovText,
            parse_mode: 'markdown',
            reply_to_message_id: message.reply_to_message.message_id
        }).subscribe();
    }

    async sendMarkovText(chatId: number, sentenceCount: number, msgLimit: number) {

        if (sentenceCount > 20) {
            sentenceCount = 20;
        }

        let dataArray = await this.database.getLastTextByChat(chatId, msgLimit)
     
        if (!dataArray) {
            return
        }

        let messageFullText = dataArray.map(message => {
            return message.text
        });

        let markovSentences = Utils.generateUniqueText(messageFullText, sentenceCount, this.defaultOptions, this.generateOptions);

        let rngScore = markovSentences.map(val => val.score).reduce((a, b) => a + b, 0)

        let markovText = markovSentences.map(val => val.string).join('\n');
        markovText += `\n\n*count*: ${dataArray.length} msgs`;
        markovText += `\n*rng score*: ${rngScore} to ${markovSentences.length} sentences`

        this.api.sendMessage({
            chat_id: chatId,
            text: markovText,
            parse_mode: 'markdown'
        }).subscribe();

    }


}