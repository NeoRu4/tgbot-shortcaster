import { assignIn, cloneDeep, flatten, includes, isEmpty, isString, slice, some, uniqBy } from 'lodash'


function getRandom<T>(array: T[], randFunc: () => number = Math.random): T | undefined {
  const length = array == null ? 0 : array.length;
  return length ? array[Math.floor(randFunc() * length)] : undefined;
}

export type MarkovGenerateOptions = {
  maxTries?: number,
  randFunc?: () => number,
  filter?: (result: MarkovResult) => boolean
}

export type MarkovConstructorOptions = {
  stateSize?: number
}

export type MarkovResult = {
  string: string,
  score: number,
  refs: Array<string>,
  tries: number
}

export type MarkovFragment = {
  word: string
  refs: Array<{ string: string }>
}

export type LexemeMap = { 
  [key: string]: MarkovFragment[] 
}

export class Markov {

  public data: Array<{ string: string }>;
  public startWords: MarkovFragment[] = [];
  public endWords: MarkovFragment[] = [];
  public lexemeTable: LexemeMap = {};
  public options: MarkovConstructorOptions;

  private defaultOptions: MarkovConstructorOptions = {
    stateSize: 2
  };

  constructor(data: string[] | Array<{ string: string }>, options: MarkovConstructorOptions = {}) {

    if (isString(data[0])) {
      data = (data as string[]).map(s => ({ string: s }));
    } else if (!data[0].hasOwnProperty('string')) {
      throw new Error('Объекты не строка');
    }
    
    this.data = data as Array<{ string: string }>;

    this.options = this.defaultOptions;
    assignIn(this.options, options);
  }

  public buildLexemeTable(): void {

    if (!this.data) {
        throw new Error('Нет данных для обучения');
    }

    const options = this.options;

    this.data.forEach(item => {

      const line = item.string;
      const words = line.split(' ');
      const stateSize = options.stateSize!;

      // Начало предложения
      const start = slice(words, 0, stateSize).join(' ')
      this._makeWordsFragment(this.startWords, item, start);

      // Остальная часть предложения
      const end = slice(words, words.length - stateSize, words.length).join(' ')
      this._makeWordsFragment(this.endWords, item, end);

      for (let i = 0; i < words.length - 1; i++) {

        const curr = slice(words, i, i + stateSize).join(' ');
        const next = slice(words, i + stateSize, i + stateSize * 2).join(' ');

        if (!next || next.split(' ').length !== options.stateSize) {
            continue;
        }

        if (this.lexemeTable.hasOwnProperty(curr)) {
          // если лексемой у лексемы есть цепочка
          this._makeWordsFragment(this.lexemeTable[curr], item, next);
        } else {
          this.lexemeTable[curr] = [{ word: next, refs: [item] }];
        }
      }
    })
    // console.log( this.lexemeTable)
  }

  private _makeWordsFragment(fragment: MarkovFragment[], item: {string: string},  joinedString: string ) {

    const oldStartObj = fragment.find(o => o.word === joinedString);
    if (oldStartObj) {
      if (!includes(oldStartObj.refs, item)) {
        oldStartObj.refs.push(item);
      }
    } else {
        fragment.push({ word: joinedString, refs: [item] });
    }
  }

  public generateSentence(options: MarkovGenerateOptions = {}): MarkovResult {

    if (isEmpty(this.lexemeTable)) {
        throw new Error('Модель не обучена');
    }

    const lexemeTable = cloneDeep(this.lexemeTable);
    const maxTries = options.maxTries ? options.maxTries : 10;
    const prng = options.randFunc ? options.randFunc : Math.random;

    let tries: number;

    for (tries = 1; tries <= maxTries; tries++) {

        let ended = false;

        const arr = [getRandom(this.startWords, prng)!];
        let score = 0

        for (let innerTries = 0; innerTries < maxTries; innerTries++) {

            const block = arr[arr.length - 1]
            const state: MarkovFragment = getRandom(lexemeTable[block.word], prng)

            if (!state) {
                break
            }

            arr.push(state)

            score += lexemeTable[block.word].length - 1

            if (some(this.endWords, { word: state.word })) {
                ended = true
                break
            }
        }

        const sentence = arr.map(o => o.word)
            .join(' ')
            .trim()

        const result = {
            string: sentence,
            score: score,
            refs: uniqBy(flatten(arr.map(o => o.refs)), 'string'),
            tries: tries
        }

        if (!ended || (typeof(options.filter) === 'function' && !options.filter(result))) {
            continue
        }

        return result
    }

    throw new Error(`Failed to build a sentence after ${tries - 1} tries`)
  }

}