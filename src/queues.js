module.exports.Queue = Queue
module.exports.QueueConsumer = QueueConsumer

function Queue() {
    const items = [];
    const pendingConsumers = [];
    let onEmptyCallback = () => {};
    let thisQueue = this;

    function queueIsEmpty() {
        return items.length === 0;
    }

    function thereArePendingConsumers() {
        return pendingConsumers.length !== 0;
    }

    function wakeUpConsumer(item) {
        pendingConsumers.shift()(item);
    }

    function enqueueConsumer() {
        //console.debug('Enqueuing the caller');

        return new Promise((resolve) => {
            pendingConsumers.push(resolve);
        });
    }

    function enqueueItem(newItem) {
        items.push(newItem);
    }

    function dequeueItem() {
        const ret = items.shift();

        if (queueIsEmpty()) {
            setTimeout(() => onEmptyCallback(thisQueue), 0);
        }

        return ret;
    }

    this.push = function(newItem) {
        if (thereArePendingConsumers()) {
            wakeUpConsumer(newItem);
        } else {
            enqueueItem(newItem);
        }
    }

    this.pop = async function() {
        if (queueIsEmpty() || thereArePendingConsumers()) {
            return enqueueConsumer();
        } else {
            return Promise.resolve(dequeueItem());
        }
    }

    this.length = function() {
        return items.length;
    }

    this.onEmpty = function(callback) {
        onEmptyCallback = callback;
    }

}

function QueueConsumer(queue) {
    let isConsuming = false;
    
    async function popItemsFromQueue(queue, callback) {
        const asyncCallback = async (item) => callback(item);

        return queue.pop()
            .then((item) => asyncCallback(item).then(() => popItemsFromQueue(queue, callback)));
    }

    this.startConsuming = function(callback) {
        if (isConsuming) {
            throw new Error('QueueConsumer is already consuming a queue');
        }

        popItemsFromQueue(queue, callback);
    }

}
