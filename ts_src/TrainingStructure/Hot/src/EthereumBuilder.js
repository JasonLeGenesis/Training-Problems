"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumBuilder = void 0;
const builder_1 = require("./builder");
const Utils_1 = require("./Utils");
const utils_1 = require("ethers/lib/utils");
const transactions_1 = require("@ethersproject/transactions");
const alchemy_sdk_1 = require("alchemy-sdk");
class EthereumBuilder extends builder_1.Builder {
    //Contains all necessary information for account. filled out with .init()
    data;
    constructor(xpub, path) {
        super(xpub, path);
    }
    init = async () => {
        return this;
    };
    //Method that logs all relevant wallet data.
    show = async () => {
        return this;
    };
    //Base method used to create an unsigned transaction object. Writes a signature request to ./data/signature_requests.json to be imported to crt-cold for signing.
    //stores the unsigned transaction to this.transaction
    async createTransaction(targetAddress, value, { gasPrice = 3000, nonce = 0, gasLimit = 75000 } = {}) {
        console.log("data", this.data);
        var transaction = {
            to: targetAddress,
            value: value,
            gasPrice: gasPrice,
            nonce: nonce,
            gasLimit: gasLimit
        };
        var serializedTx = (0, transactions_1.serialize)(transaction);
        var hashedTx = (0, utils_1.keccak256)(serializedTx);
        const request = {
            message: hashedTx,
            publicKey: this.data.publicKey,
            path: this.data.path,
            curve: "ECDSA",
        };
        console.log(request);
        var records = await (0, Utils_1.writeRecords)(this.data, { preimage: serializedTx, signatureRequests: [request] });
    }
    //Base method used to sign a transaction. After a signature response is created by crt-cold either manually or with the API, this reconstructs the transaction using a preimage and injects the signature
    //to the transaction
    async signTransaction() {
        const fs = require('fs');
        const ethers = require("ethers");
        var signed = fs.readFileSync("data/signature_response.json");
        signed = JSON.parse(signed);
        console.log("Signed file", signed);
        var signature = signed["signatureResponse"][0]["signature"];
        var rebuilt_tx = ethers.utils.parseTransaction(signed['preimage']);
        console.log("Signature:", signature);
        console.log("RebuiltTx", rebuilt_tx);
        console.log("Signing! \n\n\n");
        var signedTx = ethers.utils.serializeTransaction(rebuilt_tx, signature);
        console.log("SingedTX:", signedTx);
        return signedTx;
    }
    ;
    //posts the transaction on the testnet and logs a link to view the transaction on the block explorer
    async postTransaction(transaction) {
        const settings = {
            apiKey: 'YhzzElLVr_4SsBK62rqoa_Ay2YAUBt27',
            network: alchemy_sdk_1.Network.ETH_GOERLI
        };
        const alchemy = new alchemy_sdk_1.Alchemy(settings);
        let tx = await alchemy.core.sendTransaction(transaction);
        console.log("Sent transaction", tx);
    }
}
exports.EthereumBuilder = EthereumBuilder;
async function main() {
    //Initialize Hot Wallet
    const HotWallet = {
        rootXpub: "xpub6GE5XAE5a6FuYbgboiPe8hPBbji26zoPCnN2Yge73E9EYbvPWcM6k9cFftmxhAx5rQtn7GjmsFkwZGEkZeLY9SVwH8wR85o28Nak6NCbzpk",
        rootXpubPath: "m/44'/60'/0'",
        publicKey: "02860286384be2fa86e7b38faa920d2a3d07d6394e902d59e0562a7ad8f677d222",
        address: "",
        path: "m/44'/60'/0'/0/0",
        gasFeeData: 20
    };
    const Build = new EthereumBuilder(HotWallet.rootXpub, HotWallet.path);
    Build.data = HotWallet;
    console.log("Build data", Build.data);
    const args = process.argv;
    if (args.length > 2) {
        if (args[2] == "--sign") {
            var signedTx = await Build.signTransaction();
            console.log("Signing and Posting Transaction!");
            await Build.postTransaction(signedTx);
            console.log("Transaction Posted!");
        }
    }
    else {
        console.log("Building Transaction!");
        //Create Transaction
        console.log(await Build.createTransaction("0xC8c46eB9CFBd2576FD4114fEa01B5C3fA004eDD3", 200, { nonce: 2 }));
    }
}
main();
//# sourceMappingURL=EthereumBuilder.js.map