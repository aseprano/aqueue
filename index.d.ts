// Type definitions for @darkbyte/aqueue 1.2.2
// Project: https://github.com/aseprano/aqueue
// Definitions by: Antonio Seprano <https://github.com/aseprano>

interface Queue<T> {
    push(newItem: T): void;
    pop(): Promise<T>;
}

interface QueueConstructor {
    new(): Queue<any>;
    new<T>(): Queue<T>;
    readonly prototype: Queue<any>;
}
declare var Queue: QueueConstructor;

interface QueueConsumer<T> {
    startConsuming(callback: (item: T) => void): void;
}

interface QueueConsumerConstructor {
    new(queue: Queue<any>): QueueConsumer<any>;
    new<T>(queue: Queue<T>): QueueConsumer<T>;
    readonly prototype: QueueConsumer<any>;
}
declare var QueueConsumer: QueueConsumerConstructor;
