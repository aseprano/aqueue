import { Queue } from "./Queue";
import { Consumable } from "./Consumable";

type Callback<T> = (item: T) => Promise<void>;

export class QueueConsumer<T> {
    private started = false;
    private paused = false;
    private popping = false;
    private callback: Callback<T> = async () => {};

    constructor(
        private readonly queue: Queue<T>
    ) {}

    private alreadyStarted(): boolean {
        return this.started;
    }

    private isPaused(): boolean {
        return this.paused;
    }

    private isPopping(): boolean {
        return this.popping;
    }

    private async popOneItem(): Promise<Consumable<T>> {
        this.popping = true;

        return this.queue.pop()
            .then((item) => {
                this.popping = false;
                return item;
            });
    }

    private async popItemsFromQueue(callback: Callback<T>): Promise<void> {
        return this.popOneItem()
            .then((consumableItem) => {
                if (this.isPaused()) {
                    consumableItem.reject();
                } else {
                    return callback(consumableItem.getContent())
                        .then(() => consumableItem.consume(), () => consumableItem.reject())
                        .then(() => this.isPaused() ? undefined : this.popItemsFromQueue(callback));
                }
            });
    }

    public startConsuming(callback: Callback<T>) {
        if (this.alreadyStarted()) {
            throw new Error('QueueConsumer already started');
        }

        this.callback = callback;
        this.popItemsFromQueue(callback);
    }

    public pause() {
        this.paused = true;
    }

    public resume() {
        this.paused = false;

        if (!this.isPopping()) {
            this.popItemsFromQueue(this.callback);
        }
    }

}
