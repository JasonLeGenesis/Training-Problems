import { Builder } from './builder';
import { WalletData } from "./EthUtils";
export declare class EthereumBuilder extends Builder {
    data: WalletData;
    constructor(xpub: any, path: any);
    init: () => Promise<this>;
    show: () => Promise<any>;
    createTransaction(targetAddress: any, value: number, { gasPrice, nonce, gasLimit }?: {
        gasPrice?: number;
        nonce?: number;
        gasLimit?: number;
    }): Promise<any>;
    signTransaction(): Promise<any>;
    postTransaction(transaction: any): Promise<any>;
}
