module.exports.Queue = Queue
module.exports.QueueConsumer = QueueConsumer

function Queue() {
    const items = [];
    const pendingConsumers = [];
    
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
        return items.shift();
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

}

function QueueConsumer(queue) {
    let isConsuming = false;
    
    function popItemsFromQueue(queue, callback) {
        return queue.pop()
            .then((item) => {
                callback(item);
                return popItemsFromQueue(queue, callback);
            });
    }

    this.startConsuming = function(callback) {
        if (isConsuming) {
            throw new Error('QueueConsumer is already consuming a queue');
        }

        popItemsFromQueue(queue, callback);
    }

}
