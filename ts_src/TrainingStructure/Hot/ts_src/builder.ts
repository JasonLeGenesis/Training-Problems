export abstract class Builder {
    xpub: any;
    path: any;

    constructor(xpub: any, path: any) {
        this.xpub = xpub;
        this.path = path;
    }

    abstract init(): Promise<any>;
    abstract show(): Promise<any>;
    abstract createTransaction(targetAddress: string, value: number, extras: any): Promise<any>;
    abstract signTransaction(): Promise<any>;
    abstract postTransaction(transaction): Promise<any>;
}