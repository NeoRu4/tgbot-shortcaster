import { TelegramBotEmitter } from "./api/emitter";
import { Message } from "./api/api";
import { WriteMarkovMethod } from "./bot/write-markov-method";
import { MarkovTextMethod } from "./bot/markov-text-method";
import { AbstractMethod } from "./bot/abstract/abstract-method";
import { SQLiteService } from "./service/sql-lite";

import { UserMarkovTextMethod } from "./bot/user-markov-text-method";

export interface TelegramRouter {
    command: string;
    instance: AbstractMethod;
}


export class TelegramBot {

    botApi: TelegramBotEmitter;
    database: SQLiteService;

    private routeMap: Array<TelegramRouter>;

    constructor() {
        
        
        this.database = new SQLiteService()
        this.botApi = new TelegramBotEmitter({token: process.env.TELEGRAM_API_KEY});
        
        this.botApi.on('message', message => this.messageHandler(message));
        
        this.botApi.on('error', message => {
            console.error(message);
            // this.botApi.stop();
        });
        

        this.routeMap = [
            {
                command: '',
                instance: new WriteMarkovMethod(this)
            },
        ];

        this.routeMap.push({
            command: '/m',
            instance: new MarkovTextMethod(this)
        });

        this.routeMap.push({
            command: '/mu',
            instance: new UserMarkovTextMethod(this)
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