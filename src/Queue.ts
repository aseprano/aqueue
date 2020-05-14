import { Consumable } from "./Consumable";

type ItemConsumer<T> = (item: T) => void;
type OnEmptyCallbackType<T> = (queue: Queue<T>) => void;

export class Queue<T> {
    private items: T[] = [];
    private pendingConsumers: ItemConsumer<T>[] = [];
    private onEmptyCallback: OnEmptyCallbackType<T> = () => {};
    
    private queueIsEmpty(): boolean {
        return this.items.length === 0;
    }

    private thereArePendingConsumers(): boolean {
        return this.pendingConsumers.length !== 0;
    }

    private wakeUpConsumer(item: T): void {
        const consumer: (item: T) => void = this.pendingConsumers.shift()!;
        consumer(item);
    }

    private enqueueConsumer(): Promise<T> {
        return new Promise((resolve) => {
            this.pendingConsumers.push(resolve);
        });
    }

    private enqueueItem(newItem: T) {
        this.items.push(newItem);
    }

    private dequeueItem(): T {
        const ret = this.items.shift();

        if (this.queueIsEmpty()) {
            setTimeout(() => this.onEmptyCallback(this), 0);
        }

        return ret!;
    }

    private pushFront(newItem: T): void {
        if (this.thereArePendingConsumers()) {
            this.wakeUpConsumer(newItem);
        } else {
            this.items.unshift(newItem);
        }
    }

    public push(newItem: T): void {
        if (this.thereArePendingConsumers()) {
            this.wakeUpConsumer(newItem);
        } else {
            this.enqueueItem(newItem);
        }
    }

    async pop(): Promise<Consumable<T>> {
        return (this.queueIsEmpty() || this.thereArePendingConsumers() ?
            this.enqueueConsumer() :
            Promise.resolve(this.dequeueItem())
        ).then((item) => new Consumable(item, (item) => this.pushFront(item)));
    }

    public length() {
        return this.items.length;
    }

    public onEmpty(callback: OnEmptyCallbackType<T>) {
        this.onEmptyCallback = callback;
    }

}
