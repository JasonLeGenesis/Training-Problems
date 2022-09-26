"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bip32_1 = __importDefault(require("bip32"));
const ecc = __importStar(require("tiny-secp256k1"));
const ecpair_1 = __importDefault(require("ecpair"));
const ECPair = (0, ecpair_1.default)(ecc);
//Import libraries
const json = require("JSON");
const axios = require("axios").default;
var bitcoin = require("bitcoinjs-lib");
var assert = require("assert");
var bip39 = require("bip39");
var cr = require("crypto");
const bip32 = (0, bip32_1.default)(ecc);
const main = async () => {
    /** Create a mneumonic seed phrase & master key pair**/
    //Create mneumonic
    const mnemonic = bip39.entropyToMnemonic('00000000056743000000000000000000');
    console.log(`Mnemonic: ${mnemonic}`);
    //Create Seed with pass phrase
    const seed = bip39.mnemonicToSeedSync(mnemonic, 'Jason');
    console.log(`Seed to string: ${seed.toString('hex')}`);
    assert(bip39.validateMnemonic(mnemonic));
    //Master private key + chain code
    const root = bip32.fromSeed(seed);
    console.log(root);
    console.log("Public key:" + root.publicKey.toString('hex'));
    console.log("Private key:" + root.privateKey.toString('hex'));
    console.log("\n\n\n");
    //Create children address
    //m / purpose' / coin_type' / account' / change / address_index
    var path = "m/44'/1'/0'/0/0";
    const child = root.derivePath(path);
    const validator = (pubkey, msghash, signature) => ECPair.fromPublicKey(pubkey).verify(msghash, signature);
    function getAddress(node, network) {
        return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address;
    }
    var address = getAddress(child, bitcoin.networks.testnet);
    console.log(address);
    console.log("\n\n\n");
    //Result: Success! You have been sent 0.00064513 tBTC!
    var PastTrans = await axios.get('https://blockstream.info/testnet/api/address/msXMiXJVSBC49mTmYmCMuRLN7NYTU61Kcw/utxo');
    var raw = await axios.get(`https://blockstream.info/testnet/api/tx/${PastTrans.txid}/hex`);
    console.log(raw.data);
    PastTrans = PastTrans.data[0];
    //Get raw transaction
    console.log("\n\n\n");
    console.log("Raw Transaction:\n");
    console.log(PastTrans);
    console.log("\n\n\n");
    //Create transaction
    const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet, maximumFeeRate: 7000 });
    psbt.addInput({
        hash: PastTrans.txid,
        index: PastTrans.vout,
        sequence: 0xffffffff,
        nonWitnessUtxo: Buffer.from(raw.data, 'hex')
    });
    psbt.addOutput({
        address: 'mv4rnyY3Su5gjcDNzbMLKBQkBicCtHUtFB',
        value: 10000
    });
    psbt.signInput(0, child);
    //psbt.validateSignaturesOfInput(0, validator);
    psbt.finalizeAllInputs(true);
    console.log(psbt.data);
    //Extract transaction
    console.log("Extract transaction");
    var trans = psbt.extractTransaction().toHex();
    console.log(trans);
    //Broadcasting the transaction 
    //var trans = psbt.extractTransaction().toHex()
    try {
        var upload = await axios.post('https://blockstream.info/testnet/api/tx', { trans }, {});
        console.log(upload);
    }
    catch (err) {
        console.log(err);
    }
};
main();
//# sourceMappingURL=exercise02.js.map