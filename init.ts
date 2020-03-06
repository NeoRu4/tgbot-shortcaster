import { Markov, MarkovGenerateOptions } from './markov2';
import * as fs from 'fs';
import { Utils } from './utils';

const options: MarkovGenerateOptions = {
    maxTries: 180,
    randFunc: Math.random,
    filter: (result) => {
        return result.string.split(' ').length >= 10 && 
        (/[.!?]$/g).test(result.string)
      }
}
function readFile(fileName: string) {

    const str = fs.readFileSync(fileName, 'utf8');
    const sentenceArray = Utils.stringToSentenceArray(str)

    let markov = new Markov(sentenceArray);
    markov.buildLexemeTable();
    console.log(markov.generateSentence(options))
    // console.log(markov.resultText)
}  

readFile('./text.txt');
