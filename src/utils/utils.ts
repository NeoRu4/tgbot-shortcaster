import { Markov, MarkovConstructorOptions, MarkovGenerateOptions, MarkovResult } from "../markov";

export class Utils {

    //Если в предыдущей строке есть знаки препинания
    static trimUpperIfHaveDots(word: string, previous: string): string {

        if (previous && !word.match('[.!?]') ||
            !word.match('/[A-ZА-Я]/g')) {

            return word
        }

        return word.toLowerCase();
    }

    static pushArrayInToMap(arrayMap: Map<string, Array<any>>, key: string, value: Array<any>) {

        if (!value) {
            return;
        }
        value = value.filter(val => key != val);
        let wordArrayFromMap = arrayMap.get(key) || [];
        arrayMap.set(key, wordArrayFromMap.concat(value))
    }

    static capitalizeFirstLetter(str: string) {
        return str[0].toUpperCase() + str.slice(1);
    }

    static random(low: number, high: number) {
        return Math.random() * (high - low) + low
    }

    static randomInt(low, high) {
        return Math.floor(this.random(low, high));
    }

    static getRandomItemFromArray(array: Array<any>) {
        return array[Math.floor(this.randomInt(0, array.length))];
    }

    static stringToSentenceArray(text: string): Array<string> {
        let readyText = text   
                .replace(/[\r\n\t]/gm, ' ')
                .replace(/[;]/gm, '.')
                // .replace(/[^a-zёа-я0-9 -!?.,]/gi, ' ')  
                .replace(/(\s+)/g, ' ')                   
                .replace(/([-!?.,])+/g, '$1')
                .replace(/([.!?])/g, '$1; ')

        return readyText.split(';')
                        .map(value => value.trim())
                        .filter(value => value && value.length > 0)
    }

    static modifyMessage(text: string) {

        let message = text;

        if (!(/[.!?]$/g).test(message) ) {
            message += '.';
        }

        return message
    }
    

    static generateUniqueText(sentenceArray: Array<string>, sentenceCount: number, constructorOptions: MarkovConstructorOptions, options: MarkovGenerateOptions): Array<MarkovResult> {

        let markov = new Markov(sentenceArray, constructorOptions);
        markov.buildLexemeTable();

        let controlStrings: Array<MarkovResult> = [];

        let usageCount = 0
        const maxUsageCount = sentenceCount * 2

        for (let index = 0; (index < sentenceCount || usageCount <= maxUsageCount); index++) {

            const genText = markov.generateSentence(options);
            usageCount++;

            if (controlStrings.map(val => val.string).includes(genText.string) ||
                genText.score == 0) {
                sentenceCount++;
                continue;
            }

            controlStrings.push(genText);
        }

        return controlStrings.filter((v, i, a) => a.indexOf(v) === i);
    }
}