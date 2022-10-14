export declare abstract class Builder {
    xpub: any;
    path: any;
    constructor(xpub: any, path: any);
    abstract init(): Promise<any>;
    abstract show(): Promise<any>;
    abstract createTransaction(targetAddress: string, value: number, extras: any): Promise<any>;
    abstract signTransaction(): Promise<any>;
    abstract postTransaction(transaction: any): Promise<any>;
}
