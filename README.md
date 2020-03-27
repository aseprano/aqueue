Asynchronous locking queue for node.

[![node](https://img.shields.io/node/v/@darkbyte/aqueue)](https://www.npmjs.com/package/@darkbyte/aqueue) 

## Examples
#### Using the queue
```javascript
const { Queue } = require('./');

const queue = new Queue();

queue.pop()
    .then((item) => {
        console.debug(`Got item: ${item}`);
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

#### Consuming the queue automagically
``` javascript
const { Queue, QueueConsumer } = require('./');

const queue = new Queue(); // queue is empty
const consumer = new QueueConsumer(queue);

// The consumer will automatically pop the items from
// the queue, one by one
consumer.startConsuming((item) => {
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

## How to install
`npm install @darkbyte/aqueue`

## License
Copyright © 2019 Antonio Seprano <antonio.seprano@gmail.com>

This work is free. You can redistribute it and/or modify it under the
terms of the [MIT License](https://opensource.org/licenses/MIT).
See LICENSE for full details.

