import { Utils } from "./src/utils/utils";

export class Markov {

    private lexemeMap: Map<string, Array<string>> = new Map();
    private initText: string = '';
    private sentenceCount: number;
    
    private readonly MIN_WORD_SIZE_ON_END: number = 4;
    private readonly PUNCT_MARKS = /[.!?]/g;
    
    private _resultText = '';

    get resultText(): string {
        return this._resultText;
    }

    constructor(text: string, sentenceCount: number = 5) {

        this.initText = text;
        this.sentenceCount = sentenceCount;

        this._prepareLexems(this.initText);
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
                            .replace(/\.+/gm, '.');                 //Убираем многоточия
                                
        const wordsArray = parsableString.split(' ');
 
        let lexemeMap = new Map();
        
        for (let key = 0; key < wordsArray.length; key++) {

            if (!wordsArray[key + 1]) {
                continue;
            }

            let word = wordsArray[key];

            let previousWord = wordsArray[key - 1] || null;
            word = Utils.trimUpperIfHaveDots(word, previousWord).trim();
            
            if (word.length < 1) {
                continue;
            }

            let nextWord = wordsArray[key + 1];
            nextWord = Utils.trimUpperIfHaveDots(nextWord, word).trim();

            Utils.pushArrayInToMap(lexemeMap, word, nextWord);

            //Если слово со спец символом, нужно добавить без него
            if (word.match(this.PUNCT_MARKS)) {
                const wordWOSpecChar = word.replace(this.PUNCT_MARKS, '');
                Utils.pushArrayInToMap(lexemeMap, wordWOSpecChar, nextWord );
            }
            
        }

        this.lexemeMap = lexemeMap;

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
                const sentenceLen = sentence.length
                if (sentenceLen >= fixedSentenceLenght) {

                    let wordIndx = sentenceLen - 1;
                    let lastWord = sentence[wordIndx];

                    while (lastWord.length < this.MIN_WORD_SIZE_ON_END) {

                        sentence.pop();
                        wordIndx--;
                        lastWord = sentence[wordIndx];
                        sentence[wordIndx] = lastWord.replace(/[,]/g, ''); 
                    }

                    if (!lastWord.match(/[.!?]$/g)) {
                        sentence.push('.')
                    }
                    break;
                }

                word = this._getRandomWord(word);

                if (word.match(this.PUNCT_MARKS)) {
                    word = word.replace(this.PUNCT_MARKS, '');
                }

                sentence.push(word);
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
