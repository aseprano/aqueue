// Type definitions for @darkbyte/aqueue 1.1.0
// Project: https://github.com/aseprano/aqueue
// Definitions by: Antonio Seprano <https://github.com/aseprano>

declare class Queue<T> {

    push(newItem: T): void;

    pop(): Promise<T>;

}

declare class QueueConsumer<T> {

    constructor(queue: Queue<T>);

    startConsuming(callback: (item: T) => void): void;

}
