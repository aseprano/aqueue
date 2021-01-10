import { Queue } from '../src/Queue';

describe('Queue', () => {

    it('starts empty', () => {
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

    it('invokes the custom callback when the queue becomes empty', (done) => {
        const queue = new Queue<number>();

        queue.onEmpty(done);

        queue.pop(); // should wait indefinitely
        queue.push(1);
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
