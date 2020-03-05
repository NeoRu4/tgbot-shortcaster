export class Utils {

    //Если в предыдущей строке есть знаки препинания
    static trimUpperIfHaveDots(word: string, previous: string): string {
        
        if (previous && !word.match('[.!?]') || 
            !word.match('/[A-ZА-Я]/g')) {

            return word
        }

        return word.toLowerCase();
    }

    static pushArrayInToMap(arrayMap: Map<string, Array<any>>, key: string, value: any) {
        let wordArrayFromMap = arrayMap.get(key) || []
        wordArrayFromMap.push(value)
        arrayMap.set(value, wordArrayFromMap)
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
}