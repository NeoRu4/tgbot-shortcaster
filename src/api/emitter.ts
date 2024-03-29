import * as API from './api';
import { EventEmitter } from 'events';
import { take } from 'rxjs/operators';

export declare interface TelegramBotEmitter
{
    on (event: 'error',                 listener: (p: Error | string) => void): this;
    on (event: 'message',               listener: (p: API.Message) => void): this;
    on (event: 'edited_message',        listener: (p: API.Message) => void): this;
    on (event: 'channel_post',          listener: (p: API.Message) => void): this;
    on (event: 'edited_channel_post',   listener: (p: API.Message) => void): this;
    on (event: 'inline_query',          listener: (p: API.InlineQuery) => void): this;
    on (event: 'chosen_inline_result',  listener: (p: API.ChosenInlineResult) => void): this;
    on (event: 'callback_query',        listener: (p: API.CallbackQuery) => void): this;
    on (event: 'shipping_query',        listener: (p: API.ShippingQuery) => void): this;
    on (event: 'pre_checkout_query',    listener: (p: API.PreCheckoutQuery) => void): this;
}

export class TelegramBotEmitter extends EventEmitter
{
    /**
     * The object to make raw requests
     */
    public readonly api: API.TelegramBotRaw;

    /**
     * When this flag is true, when this object recives an update,
     * immediately re-send another getUpdates request for next updates.
     */
    private continueUpdates: boolean = false;

    /**
     * Last update_id received. Update identifiers
     * start from a certain positive number and increase sequentially.
     * This ID becomes especially handy if you’re using Webhooks,
     * since it allows you to ignore repeated updates or to restore
     * the correct update sequence, should they get out of order.
     * If there are no new updates for at least a week, then identifier
     * of the next update will be chosen randomly instead of sequentially.
     */
    private lastUpdateId: number = 0;


    constructor (settings: API.BotSettings)
    {
        // Construct the EventEmitter object
        super ();

        // The object to make raw requests
        this.api = new API.TelegramBotRaw (settings);

        // Start the polling of the updates
        this.start ();
    }

    /**
     * Put this object into listening state.
     * The object will emit events for each new update.
     */
    public start ()
    {
        if (!this.continueUpdates) {
            this.dispatchUpdates ();
        }
    }

    /**
     * Stop this object form the listening state.
     * After the response of the getUpdates request it
     * will not make any other requests.     *
     */
    public stop ()
    {
        if (this.continueUpdates) {
            this.continueUpdates = false;
        }
    }

    /**
     * Continue to make getUpdates requests and
     * emit the appropriate event until the flag continueUpdates is true.
     */
    private async dispatchUpdates () {

        this.continueUpdates = true;

        while (this.continueUpdates) {
                try {

                    const rxQuery = this.api.getUpdates ({
                        timeout: 600,
                        offset: this.lastUpdateId + 1
                    })

                    const updates = (await rxQuery.pipe(take(1)).toPromise())

                    for (let update of updates) {
                        for (let key in update) {
                            if (key !== 'update_id') {
                                this.emit(key, (update as any)[key]);
                            }
                        }
                    }

                    if (updates.length) {
                        this.lastUpdateId = updates[updates.length-1].update_id;
                    }
                } catch (error) {
                    this.emit ('error', error);
                }
        }
    }
}
