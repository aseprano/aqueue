Asynchronous locking queue for node.

[![node](https://img.shields.io/node/v/@darkbyte/aqueue)](https://www.npmjs.com/package/@darkbyte/aqueue) 

## Examples
#### Using the queue
```javascript
const { Queue } = require('./');

const queue = new Queue();

queue.pop()
    .then((consumable) => {
        console.debug(`Got item: ${consumable.getItem()}`);
        consumable.consume(); // mark item as consumed
    }); // the item will be returned lately

console.debug('Waiting a bit');
console.debug('...');

// Produce a new number in 3 seconds
setTimeout(() => {
    console.debug('Pushing a new item');
    queue.push(42);
}, 3000);

/* Expected output:
Waiting a bit
...

(after 3 seconds)
Pushing a new item
Got item: 42
```

#### Rejecting an item

The queue returns items that can be rejected or consumed. When the consume() or the reject() method is invoked on a queue item, it is marked as completed and no more actions can be taken on it.
When an item is rejected, it is put back at the head of the queue, ready to be extracted with the next call to pop().
In the following example, a queue of messages must be delivered through a connection.
If the connection is closed, you don't want to effectively consume the items from the queue. Rather, you put them back to be processed whenever the connection becomes available again:

``` TypeScript
const queue = new Queue<Message>();
const connection = ...;

queue.pop()
    .then((item: Consumable<Message>) => {
        if (!connection.isOpen()) {
            item.reject(); // puts the message back at the head of the queue
        } else {
            connection.send(item.getContent()) // extracts the Message from the queue item and pass it to the connection
                .then(() => item.consume()) // marks the item as completed
                .catch((error) => item.reject()); // in case of error, the item is put back at head of the queue
        }
```

#### Consuming the queue automagically
``` TypeScript
const { Queue, QueueConsumer } = require('./');

const queue = new Queue<number>(); // queue is empty
const consumer = new QueueConsumer(queue);

// The consumer will automatically pop the items from
// the queue, one by one
consumer.startConsuming((item: number) => {
    console.debug(`Got item: ${item}`);
});

// We push an item every second
let number = 0;
setInterval(() => {
    queue.push(number++); // The consumer is unlocked just now
}, 1000);

/* Expected outout:
   @t0:     Got item 0
   @t0+1s:  Got item 1
   @t0+2s:  Got item 2
   ...
*/
```

If an exception is thrown by the callback, the QueueConsumer will automatically reject the item extracted from the queue.

#### Pausing the consumer
A consumer can be paused and resumed at need.

``` TypeScript
const queue: Queue<Message> = new Queue();
const consumer = new QueueConsumer(queue);

consumer.startConsuming((item: Message) => {
    // use the consumed message
});

// late on...
consumer.pause(); // from now on, the consumer callback is no longer invoked

// late on...
consumer.resume(); // from now on the consumer callback gets invoked again

```


## How to install
`npm install @darkbyte/aqueue`

## License
Copyright © 2019 Antonio Seprano <antonio.seprano@gmail.com>

This work is free. You can redistribute it and/or modify it under the
terms of the [MIT License](https://opensource.org/licenses/MIT).
See LICENSE for full details.

