import { Queue } from '../src/Queue';

describe('Queue', () => {

    it('starts with no items', () => {
        const q = new Queue<number>();
        expect(q.length()).toBe(0);
    });

    it('can hold and return one item', async () => {
        const q = new Queue<number>();

        q.push(10);
        expect(q.length()).toBe(1);
        
        const item = await q.pop();
        expect(item.consume()).toBe(10);
        expect(q.length()).toBe(0);
    });

    it('invokes the custom onEmpty callback after popping the last item', (done) => {
        const queue = new Queue<number>();
        let itemHasBeenPoppedOut = false;

        queue.onEmpty(() => {
            expect(itemHasBeenPoppedOut).toBe(true);
            done();
        });

        queue.push(2);

        queue.pop()
            .then(() => {
                itemHasBeenPoppedOut = true;
            });
    });

    it('invokes the custom onEmpty callback after delivering a new item to a waiting consumer', (done) => {
        const queue = new Queue<number>();

        queue.onEmpty(() => {
            expect(queue.length()).toBe(0);
            done();
        });

        queue.pop(); // starts waiting
        queue.push(2); // wakes up the consumer
    });

    it('makes the caller wait for a new item when the queue is empty', (done) => {
        const queue = new Queue<number>();
        let timeoutExpired = false;

        queue.pop()
            .then(() => {
                expect(timeoutExpired).toBe(true);
                done();
            });

        setTimeout(
            () => {
                timeoutExpired = true;
                queue.push(3.14);
            },
            500
        );
    });

    it('serves the waiting callers when new items are pushed', (done) => {
        let caller1Invoked = false;
        let caller2Invoked = false;

        const queue = new Queue<number>();

        queue.pop().then(() => {
            expect(caller2Invoked).toBe(false);
            caller1Invoked = true;
        });

        queue.pop().then(() => {
            expect(caller1Invoked).toBe(true);
            caller2Invoked = true;
            done();
        });

        setTimeout(() => queue.push(3), 500);
        setTimeout(() => queue.push(14), 600);
    });

    it('invokes the custom callback every time the queue becomes empty', (done) => {
        let numberOfCallbackInvocations = 0;

        const queue = new Queue<number>();
        queue.onEmpty(() => numberOfCallbackInvocations++);
        
        queue.pop();
        queue.push(1);

        queue.pop();
        queue.push(3);

        setTimeout(() => {
            expect(numberOfCallbackInvocations).toBe(2);
            done();
        }, 100);
    });

});
