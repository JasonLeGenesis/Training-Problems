import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair'
import { Psbt } from 'bitcoinjs-lib';


const ECPair = ECPairFactory(ecc);
//Import libraries
const json = require("JSON")
const axios = require("axios").default 
var bitcoin = require("bitcoinjs-lib")
var assert = require("assert")
var bip39 = require("bip39");
var cr = require("crypto")
const bip32 = BIP32Factory(ecc)



const main = async () => {
/** Create a mneumonic seed phrase & master key pair**/
//Create mneumonic
const mnemonic = bip39.entropyToMnemonic('00000000056743000000000000000000');
console.log(`Mnemonic: ${mnemonic}`);
//Create Seed with pass phrase
const seed = bip39.mnemonicToSeedSync(mnemonic,'Jason');
console.log(`Seed to string: ${seed.toString('hex')}`);
assert(bip39.validateMnemonic(mnemonic));

//Master private key + chain code
const root = bip32.fromSeed(seed)
console.log(root);
console.log("Public key:" + root.publicKey.toString('hex'))
console.log("Private key:" + root.privateKey.toString('hex'))
console.log("\n\n\n")
//Create children address
//m / purpose' / coin_type' / account' / change / address_index
var path = "m/44'/1'/0'/0/0"
const child = root.derivePath(path);

const validator = (
    pubkey: Buffer,
    msghash: Buffer,
    signature: Buffer,
  ): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

function getAddress(node: any, network?: any): string {
    return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address!;
  }

var address = getAddress(child,bitcoin.networks.testnet);
console.log(address);
console.log("\n\n\n")
//Result: Success! You have been sent 0.00064513 tBTC!

var PastTrans = await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`)
PastTrans = PastTrans.data[0]
var raw = await axios.get(`https://blockstream.info/testnet/api/tx/${PastTrans.txid}/hex`)
console.log(raw.data)


//Get raw transaction
console.log("\n\n\n")
console.log("Raw Transaction:\n")
console.log(PastTrans)
console.log("\n\n\n")

//Create transaction
const psbt = new bitcoin.Psbt({network:bitcoin.networks.testnet,maximumFeeRate:7000});
psbt.addInput({
    hash : PastTrans.txid,
    index: PastTrans.vout,
    sequence: 0xffffffff, // These are defaults. This line is not needed.
    nonWitnessUtxo: Buffer.from(raw.data,'hex')
})

psbt.addOutput({
  address: 'mv4rnyY3Su5gjcDNzbMLKBQkBicCtHUtFB', 
  value: 10000}
 )

psbt.signInput(0, child);
//psbt.validateSignaturesOfInput(0, validator);
psbt.finalizeAllInputs(true);
console.log(psbt.data)

//Extract transaction
console.log("Extract transaction");
var trans =psbt.extractTransaction().toHex()
console.log(trans)
 
//Broadcasting the transaction 
//var trans = psbt.extractTransaction().toHex()
/** 
try {
    var upload = await axios.post('https://blockstream.info/testnet/api/tx',{trans},{});
    console.log(upload)
} catch(err) {
  console.log(err)
}
*/

}
main()
