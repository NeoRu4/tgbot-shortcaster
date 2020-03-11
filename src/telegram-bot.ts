import { TelegramBotEmitter } from "./api/emitter";
import { Message } from "./api/api";
import { WriteMarkovMethod } from "./bot/write-markov-method";
import { MarkovTextMethod } from "./bot/markov-text-method";
import { AbstractMethod } from "./bot/abstract/abstract-method";
import { UserMarkovTextMethod } from "./bot/user-markov-text-method";
const Config = require('../config.json');

export interface TelegramRouter {
    command: string;
    instance: AbstractMethod;
}

export class TelegramBot {

    private botApi: TelegramBotEmitter;

    private routeMap: Array<TelegramRouter>;


    constructor() {

        this.botApi = new TelegramBotEmitter(Config.bot);

        this.botApi.on('message', message => this.messageHandler(message));

        this.botApi.on('error', message => {
            console.error(message);
        });

        this.routeMap = [
            {
                command: '',
                instance: new WriteMarkovMethod(this.botApi)
            },
        ];

        this.routeMap.push({
            command: '/m',
            instance: new MarkovTextMethod(this.botApi, this.getRoute('').instance as WriteMarkovMethod)
        });

        this.routeMap.push({
            command: '/um',
            instance: new UserMarkovTextMethod(this.botApi, this.getRoute('').instance as WriteMarkovMethod)
        });

    }

    getRoute(command: string): TelegramRouter {
        return this.routeMap.find(val => val.command == command) || null;
    }


    messageHandler(message: Message) {

       const text = message.text;

       if (!text) {
           return;
       }

        if (text.startsWith('/')) {

            const params = text.split(' ');
            let route = this.getRoute(params[0].toLowerCase());
            if (route) {
                route.instance.process(message);
            }

            return;
        }

        this.getRoute('').instance.process(message);
    }

}