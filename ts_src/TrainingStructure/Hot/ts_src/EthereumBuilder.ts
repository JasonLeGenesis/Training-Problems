import {Builder} from './builder';
import {WalletData} from "./EthUtils";
import {SignatureRequest} from "./SignatureRequest";
import {writeRecords} from "./Utils";
import { keccak256 } from 'ethers/lib/utils';
import { serialize } from '@ethersproject/transactions';
import { Network, Alchemy, Utils } from 'alchemy-sdk';


export class EthereumBuilder extends Builder {

    //Contains all necessary information for account. filled out with .init()
    data: WalletData;
     


    constructor(xpub: any, path: any) {
        super(xpub, path);
    }
    init: () => Promise<this> = async () => {
        return this
    };

    //Method that logs all relevant wallet data.
    show: () => Promise<any> = async () => {
        return this
    };

    //Base method used to create an unsigned transaction object. Writes a signature request to ./data/signature_requests.json to be imported to crt-cold for signing.
    //stores the unsigned transaction to this.transaction
    async createTransaction(targetAddress: any, value: number,  {gasPrice=3000,nonce=0,gasLimit=75000 } = {}): Promise<any> {
        console.log("data",this.data)
        var transaction = {
            to: targetAddress,
            value: value,
            gasPrice: gasPrice,
            nonce: nonce,
            gasLimit: gasLimit
          }
        

        var serializedTx = serialize(transaction);
        var hashedTx = keccak256(serializedTx);
  

        const request: SignatureRequest = {
            
            message: hashedTx,
            publicKey: this.data.publicKey,
            path: this.data.path,
            curve: "ECDSA",

        }

        console.log(request)
        var records = await writeRecords(this.data, { preimage: serializedTx, signatureRequests: [request] })
        

        

        

    }
    //Base method used to sign a transaction. After a signature response is created by crt-cold either manually or with the API, this reconstructs the transaction using a preimage and injects the signature
    //to the transaction
    async signTransaction(): Promise<any> {
        const fs = require('fs')
        const ethers = require("ethers");
        var signed = fs.readFileSync("data/signature_response.json");
        signed = JSON.parse(signed);
        console.log("Signed file",signed)
        var signature = signed["signatureResponse"][0]["signature"]
        
        var rebuilt_tx = ethers.utils.parseTransaction(signed['preimage'])

        console.log("Signature:",signature)
        console.log("RebuiltTx",rebuilt_tx)
        console.log("Signing! \n\n\n")
        var signedTx = ethers.utils.serializeTransaction(rebuilt_tx,signature);
        console.log("SingedTX:",signedTx)
        return signedTx
    };

    //posts the transaction on the testnet and logs a link to view the transaction on the block explorer
    public async postTransaction(transaction: any): Promise<any> {
        const settings = {
            apiKey: 'YhzzElLVr_4SsBK62rqoa_Ay2YAUBt27', 
            network: Network.ETH_GOERLI 
        };
        const alchemy = new Alchemy(settings);
        let tx = await alchemy.core.sendTransaction(transaction);
        console.log("Sent transaction", tx);
    }
}

async function main() {
    //Initialize Hot Wallet
    const HotWallet : WalletData = {
    
    rootXpub: "xpub6GE5XAE5a6FuYbgboiPe8hPBbji26zoPCnN2Yge73E9EYbvPWcM6k9cFftmxhAx5rQtn7GjmsFkwZGEkZeLY9SVwH8wR85o28Nak6NCbzpk",
    rootXpubPath: "m/44'/60'/0'",
    publicKey: "02860286384be2fa86e7b38faa920d2a3d07d6394e902d59e0562a7ad8f677d222",
    address: "",
    path: "m/44'/60'/0'/0/0",
    gasFeeData: 20   
    
    }
    
    const Build = new EthereumBuilder(HotWallet.rootXpub,HotWallet.path);
        Build.data = HotWallet
        console.log("Build data", Build.data)

    
        
    const args = process.argv;
    if (args.length > 2) {
        if (args[2] == "--sign") {

            var signedTx = await Build.signTransaction()

            console.log("Signing and Posting Transaction!")
            
            await Build.postTransaction(signedTx)
            console.log("Transaction Posted!")
        }
    } else {
        console.log("Building Transaction!")

 
        //Create Transaction
        console.log(await Build.createTransaction("0xC8c46eB9CFBd2576FD4114fEa01B5C3fA004eDD3",200,{nonce: 2}))
    }
        


        

        
        
    
}
main();
