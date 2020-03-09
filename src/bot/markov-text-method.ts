import { Markov, MarkovGenerateOptions, MarkovResult } from '../markov';
import { Utils } from '../utils/utils';
import { AbstractMethod }  from './abstract/abstract-method';
import { TelegramBotEmitter } from '../api/emitter';
import { Message } from '../api/api';
import { WriteMarkovMethod } from './write-markov-method';

export class MarkovTextMethod extends AbstractMethod {

    private writeMarkov: WriteMarkovMethod;

    constructor(_apiEmmiter: TelegramBotEmitter, writeMarkovInstance: WriteMarkovMethod) {

        super(_apiEmmiter);

        this.writeMarkov = writeMarkovInstance;
    }
    
    process(message: Message) {

        const text = message.text.trim();

        if (message.from.username != 'neoflex4') {
            return;
        }

        const params = text.split(' ');
        const chatId = message.chat.id;
        console.log(chatId, params)

        this.sendMarkovText(
            chatId, 
            +params[1] || 4,
            +params[2] || null
        );
    }


    sendMarkovText(chatId: number, sentenceCount: number, msgLimit: number) {

        if (sentenceCount > 20) {
            sentenceCount = 20;
        }

        const options: MarkovGenerateOptions = {
            maxTries: 25,
            randFunc: Math.random,
            filter: (result) => {
                return (/[.!?]$/g).test(result.string)
              }
        }
        
        let dataFile = this.writeMarkov.readMessageDataFile(chatId);

        if (msgLimit != null && dataFile.length > msgLimit) {
            dataFile = dataFile.slice(dataFile.length - msgLimit);
        }

        let messageFullText = dataFile.map(message => {
            return message.text
        }).join(' ');

        const sentenceArray = Utils.stringToSentenceArray(messageFullText)

        let markovSentences = MarkovTextMethod.generateUniqueText(sentenceArray, sentenceCount, options);

        let rngScore = markovSentences.map(val => val.score).reduce((a, b) => a + b, 0 )

        let markovText = markovSentences.map(val => val.string).join(' ');
        markovText += `\n\n*count*: ${dataFile.length} msgs; ${sentenceArray.length} sentences`;
        markovText += `\n*rng score*: ${rngScore} to ${markovSentences.length} sentences`
        
        this.api.sendMessage({
            chat_id: chatId, 
            text: markovText,
            parse_mode: 'markdown'
        })
    }

    static generateUniqueText(sentenceArray: Array<string>, sentenceCount: number, options: MarkovGenerateOptions): Array<MarkovResult> {
        
        let markov = new Markov(sentenceArray);
        markov.buildLexemeTable();

        let controlStrings: Array<MarkovResult> = [];

        for (let index = 0; index < sentenceCount; index++) {

            const genText = markov.generateSentence(options);
            
            if (controlStrings.map(val => val.string).includes(genText.string)) {
                sentenceCount++;
                continue;
            }

            controlStrings.push(genText);
        }

        return controlStrings
    }

    
}