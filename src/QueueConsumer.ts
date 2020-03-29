import { Queue } from "./Queue";

type Callback<T> = (item: T) => Promise<void>;

export class QueueConsumer<T> {
    private isConsuming = false;
    
    constructor(private queue: Queue<T>) {}

    private popItemsFromQueue(queue: Queue<T>, callback: Callback<T>): Promise<void> {
        const asyncCallback = async (item:  T) => callback(item);

        return queue.pop()
            .then((item) => asyncCallback(item).then(() => this.popItemsFromQueue(queue, callback)));
    }

    async startConsuming(callback: Callback<T>) {
        if (this.isConsuming) {
            return Promise.reject(new Error('QueueConsumer is already consuming a queue'));
        }

        return this.popItemsFromQueue(this.queue, callback);
    }

}
