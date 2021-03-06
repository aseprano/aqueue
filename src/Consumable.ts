export class Consumable<T> {
    private terminated = false;

    constructor(
        private item: T,
        private rejectCallback: (item: T) => void
    ) { }

    private hasBeenTerminated(): boolean {
        return this.terminated;
    }

    private checkIsValid() {
        if (this.hasBeenTerminated()) {
            throw new Error('Element already consumed or rejected');
        }
    }

    private markTerminated() {
        this.checkIsValid();
        this.terminated = true;
    }

    public getContent(): T {
        this.checkIsValid();
        return this.item;
    }

    public consume(): T {
        this.markTerminated();
        return this.item;
    }

    public reject(): void {
        this.markTerminated();
        this.rejectCallback(this.item);
    }

}