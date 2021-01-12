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
        return this.pendingConsumers.length > 0;
    }

    private deliverItemToWaitingConsumer(newItem: T): boolean {
        const consumer = this.pendingConsumers.shift();

        if (!consumer) {
            return false;
        }

        setImmediate(() => consumer(newItem));

        return true;
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
            this.invokeOnEmptyCallback();
        }

        return ret!;
    }

    private invokeOnEmptyCallback() {
        setImmediate(() => this.onEmptyCallback(this));
    }

    private pushFront(newItem: T): void {
        if (this.thereArePendingConsumers()) {
            this.deliverItemToWaitingConsumer(newItem);
        } else {
            this.items.unshift(newItem);
        }
    }

    public push(newItem: T): void {
        if (this.deliverItemToWaitingConsumer(newItem)) {
            this.invokeOnEmptyCallback();
        } else {
            this.enqueueItem(newItem);
        }
    }

    /**
     * Extracts an item from the queue.
     * If no item is available, the promise is held until a new item is pushed into the queue.
     */
    async pop(): Promise<Consumable<T>> {
        return (this.queueIsEmpty() || this.thereArePendingConsumers() ?
            this.enqueueConsumer() :
            Promise.resolve(this.dequeueItem())
        ).then((item) => new Consumable(item, (item) => this.pushFront(item)));
    }

    public length() {
        return this.items.length;
    }

    /**
     * Registers a callback to be invoked as soon as the queue becomes empty.
     * When the queue becomes empty (i.e.: the last item has been removed), the callback is invoked and he queue is passed as an argument.
     * The callback is run asynchronously, hence the queue could be no longer empty the when the callback is run.
     * 
     * @param callback 
     */
    public onEmpty(callback: OnEmptyCallbackType<T>) {
        this.onEmptyCallback = callback;
    }

}
