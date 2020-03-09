import { TelegramBotRaw, Message } from "../../api/api";
import { TelegramBotEmitter } from "../../api/emitter";

export abstract class AbstractMethod {

    protected api: TelegramBotRaw;
    protected apiEmmiter: TelegramBotEmitter;

    constructor(_apiEmmiter: TelegramBotEmitter) {
        this.apiEmmiter = _apiEmmiter;
        this.api = _apiEmmiter.api;
    }

    abstract process(message: Message): void;
}