const { Queue, QueueConsumer } = require("..");

describe('QueueConsumer', () => {

    it('pops all the items out of the queue', (done) => {
        const queue = new Queue();
        queue.push(10);
        queue.push(20);
        
        const itemsPoppedOut = [];

        queue.onEmpty(() => {
            expect(itemsPoppedOut).toEqual([10, 20]);
            done();
        });

        const consumer = new QueueConsumer(queue);

        consumer.startConsuming((item) => {
            itemsPoppedOut.push(item);
        });
    });

    it('waits for the consumer callback to end before popping another item', (done) => {
        const queue = new Queue();
        queue.push(10);
        queue.push(20);

        let firstItemResolved = false;
        let secondItemResolvedBeforeFirst = false;

        const consumer = new QueueConsumer(queue);

        consumer.startConsuming((item) => {
            const isFirstItem = item === 10;
            secondItemResolvedBeforeFirst = !isFirstItem && !firstItemResolved;

            return new Promise((resolve) => {
                setTimeout(() => {
                    if (isFirstItem) {
                        firstItemResolved = true;
                    }
                    
                    resolve();
                }, 1000);
            });
        });

        queue.onEmpty(() => {
            expect(firstItemResolved).toBe(true);
            expect(secondItemResolvedBeforeFirst).toBe(false);
            done();
        });
    });

});