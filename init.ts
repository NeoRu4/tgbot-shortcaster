import { Markov } from './markov';
import * as fs from 'fs';


function readFile(fileName: string) {

    const str = fs.readFileSync(fileName, 'utf8');

    let markov = new Markov(str);
    console.log(markov.resultText)
}  

readFile('./text.txt');
