const Queue = require("../");

describe('test queue', () => {

    it('empty queue length is zero', () => {
        const q = new Queue();
        expect(q.length()).toEqual(0);
    });

    it('pushing an item to the queue will increase its length', () => {
        const q = new Queue();
        q.push(10);
        expect(q.length()).toEqual(1);
    });

    it('pops out items in the straight order', async () => {
        const q = new Queue();
        q.push(3);
        q.push(14);

        q.pop().then((n) => expect(n).toEqual(3));
        q.pop().then((n) => expect(n).toEqual(14));
    });

    it('makes the client wait for items if the queue is empty', async (done) => {
        const q = new Queue();
        
        let t1 = false;
        let t2 = false;

        q.pop().then(() => {
            expect(t1).toEqual(true);
            expect(t2).toEqual(false);
        });

        q.pop().then(() => {
            expect(t1 && t2).toEqual(true);
            done();
        });

        setTimeout(
            () => {
                t1 = true;
                q.push(1);
            },
            1000
        );

        setTimeout(
            () => {
                t2 = true;
                q.push(2);
            },
            2000
        );
    });

});

