import { Queue } from '../src/Queue';
import { QueueConsumer } from '../src/QueueConsumer';

describe('QueueConsumer', () => {

    it('pops every item out of the queue', (done) => {
        const itemsPoppedOut: Array<number> = [];

        const queue = new Queue<number>();

        queue.onEmpty(() => {
            expect(itemsPoppedOut).toEqual([
                10,
                20,
                30
            ]);

            done();
        });

        queue.push(10);
        queue.push(20);
        queue.push(30);

        const consumer = new QueueConsumer(queue);

        consumer.startConsuming(async (item) => {
            itemsPoppedOut.push(item);
        });
    });

    it('waits indefinitely until new items are pushed to the queue', (done) => {
        const queue = new Queue<number>();
        let queueHasBecomeEmpty = false;

        queue.onEmpty(() => {
            queueHasBecomeEmpty = true;
        });

        const consumer = new QueueConsumer(queue);

        consumer.startConsuming(async (item) => {
            expect(item).toBe(1955);
            expect(queueHasBecomeEmpty).toBe(true);
            done();
        });

        // let the consumer wait for one second before pushing one item to the queue
        setTimeout(() => queue.push(1955), 1000);
    });

    it('waits for the callback before popping another item', (done) => {
        const queue = new Queue<number>();
        const queueConsumer = new QueueConsumer(queue);
        let callbackHasBeenCompleted = false;

        queue.push(10);
        queue.push(20);

        queueConsumer.startConsuming(async (item) => {
            if (item === 10) {
                return new Promise((resolve) => {
                    setTimeout(
                        () => {
                            callbackHasBeenCompleted = true;
                            resolve();
                        },
                        1000
                    );
                });
            } else {
                expect(callbackHasBeenCompleted).toBe(true);
                done();
            }
        });

    });

})