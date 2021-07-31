import { TelegramBotRaw, Message } from "../../api/api";
import { TelegramBotEmitter } from "../../api/emitter";
import { SQLiteService } from "../../service/sql-lite";
import { TelegramBot } from "../../telegram-bot";

export abstract class AbstractMethod {

    protected api: TelegramBotRaw;
    protected apiEmmiter: TelegramBotEmitter;
    protected database: SQLiteService;


    constructor(_telegramBot: TelegramBot) {
        this.apiEmmiter = _telegramBot.botApi;
        this.api = _telegramBot.botApi.api;
        this.database = _telegramBot.database
    }

    abstract process(message: Message): void;
}