import { Utils } from "./utils";

export class Markov {

    private lexemeMap: Map<string, Array<string>> = new Map();
    private initText: string = '';
    private sentenceCount: number;

    private readonly MIN_WORD_SIZE_ON_END: number = 4;
    private readonly PUNCT_MARKS = /[.!?]{1,}$/g;

    private _resultText = '';

    get resultText(): string {
        return this._resultText;
    }

    constructor(text: string, sentenceCount: number = 2) {

        this.initText = text;
        this.sentenceCount = sentenceCount;

        this._prepareLexems(this.initText);
        console.log(this.lexemeMap);
        this.generateText();
    }

    private _prepareLexems(text: string) {

        if (!text) {
            throw new Error('Не указана строка');
        }

        let parsableString = text
                            .replace(/[\r\n\t]/gm, ' ')               //Убираем переносы
                            .replace(/(\s+)/g, ' ')                 //Убираем множество пробелов
                            .replace(/[^a-zёа-я0-9 -!?.,]/gi, ' ')  //Очищаем ненужные буквы
                            .replace(/\s([,.!?])/g, '$1')
                            .replace(/\.+/gm, '.');                 //Убираем многоточия

        const wordsArray = parsableString.split(' ');

        let lexemeMap = new Map();
        let isEndOfSentence = false;
        let dataSentence = [];
        for (let key = 0; key < wordsArray.length; key++) {

            let word = wordsArray[key].trim();

            if (!word || word == '') {
                continue;
            }

            dataSentence.push(word);

            // if (word.match(this.PUNCT_MARKS)) {
            //     word = word.replace(this.PUNCT_MARKS, '');
            //     dataSentence.push(word);
            // }

            if (isEndOfSentence) {
                dataSentence = dataSentence.filter(val => !val.match(this.PUNCT_MARKS));
                Markov.addSentenceData(lexemeMap, dataSentence);
                dataSentence = [word];
                isEndOfSentence = false;
            }

            if (word.match(/[,.!?]{1,}$/g)) {
                isEndOfSentence = true;
            }

        }

        Markov.addSentenceData(lexemeMap, dataSentence);

        this.lexemeMap = lexemeMap;

    }

    static addSentenceData(lexemeMap, dataSentence: Array<string>) {
        for (let i = 0; i < dataSentence.length; i++) {
            const element = dataSentence[i];
            Utils.pushArrayInToMap(lexemeMap, element, dataSentence.slice(i + 1))
        }
    }

    generateText() {

        if (this.lexemeMap.size < 1) {
            throw new Error('Модель не обучена -> _prepareLexems(text)');
        }

        let word = "";

        for (let index = 0; index <= this.sentenceCount; index++) {

            word = this._getRandomWord(word, this.PUNCT_MARKS);

            let sentence: Array<string> = [];
            sentence.push(Utils.capitalizeFirstLetter(word));

            const fixedSentenceLenght = Utils.randomInt(5, 18);

            //Пока не выпадет конец предложения
            while (!word.match(this.PUNCT_MARKS)) {


                word = this._getRandomWord(word);

                if (word.match(this.PUNCT_MARKS)) {
                    word = word.replace(this.PUNCT_MARKS, '');
                }

                sentence.push(word);

                const sentenceLen = sentence.length;
                if (sentenceLen >= fixedSentenceLenght) {

                    let wordIndx = sentenceLen - 1;
                    let lastWord = sentence[wordIndx];

                    while (lastWord.length < this.MIN_WORD_SIZE_ON_END) {

                        sentence.pop();
                        wordIndx--;
                        lastWord = sentence[wordIndx];
                        sentence[wordIndx] = lastWord.replace(/[,]/g, '');
                    }

                    if (!lastWord.match(this.PUNCT_MARKS)) {
                        sentence.push('.');
                    }
                    break;
                }
            }

            this._resultText += sentence.join(' ') + ' ';
        }

        this._resultText = this._resultText.replace(/\s([!?.,])\s/g, '$1 ');
    }

    private _getRandomWord(word: string | Array<any>, expections: RegExp = null ) {

        let newWord: string | Array<any>;

        if (!word) {

            const lexemeKeys = Array.from(this.lexemeMap.keys());
            newWord = Utils.getRandomItemFromArray(lexemeKeys);

        } else {

            let subWord = (typeof(word) == 'string' ? this.lexemeMap.get(word) : null);

            if (!subWord) {
                return this._getRandomWord("", expections);
            }

            newWord = Utils.getRandomItemFromArray(subWord);
        }

        if (!newWord ||
            newWord == word ||
            expections && typeof(newWord) == 'string' && newWord.match(expections)) {

            return this._getRandomWord(newWord, expections);
        }

        return newWord;
    }
}
