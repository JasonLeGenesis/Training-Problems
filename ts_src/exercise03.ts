import { mnemonicToSeedSync } from "bip39"
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair'
import { Psbt } from 'bitcoinjs-lib';
import { count } from "console";
import { mainModule } from "process";

//Import libraries
const json = require("JSON")
const axios = require("axios").default 
var bitcoin = require("bitcoinjs-lib")
var assert = require("assert")
var bip39 = require("bip39");
var cr = require("crypto")
const bip32 = BIP32Factory(ecc)





//Define functions 

//Return address of a node in any network
function getAddress(node: any, network?: any): string {
    return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address!;
  }

//Aggregate all values in child wallet 
async function  AggregateChild(path: string,root) {
    
    var result = new Object();
    result['funds'] = 0;
    result['utxo'] = [];
    result['child'] = []
    result['change_path'] = []
    //Devide path into 2 parts: index & prev_path
    var all_path = path.split("/");
    var index = parseInt(all_path.pop(),10);
    var prev_path = all_path.join("/");
    
    var counter = 0;
    //Check for the wallets
    while (counter < 20) {
        var child = root.derivePath(prev_path+`/${index}`);
        var address = getAddress(child,bitcoin.networks.testnet);
        //Check for UTXO 
        var PastTrans = await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`);
        PastTrans = PastTrans.data[0];
        //if there exist UTXO -> +=1 in funds ; else +1 in counter
        if (typeof PastTrans !== 'undefined') {
                result['child'].push(child);
                result['funds'] += PastTrans.value;
                result['utxo'].push(PastTrans)
                //Create change address for available funds: 
                var change_path = prev_path.replace(/.$/,'1');
                var change = root.derivePath(change_path+`/${index}`);
            
                //Append change to the result 
                result['change_path'].push(change)

            }
        else {
                counter += 1; 
            }
        /** 
        console.log(PastTrans)
        console.log("index:"+index)
        console.log('Funds: '+funds);
        console.log('Counter: '+counter);
        console.log("\n\n\n")
        */
        //Move to another child; take last character of path and increment 
        index = index + 1 ;
    }

    //An object with 3 fields: total value, all utxo and all used child elements
    return result
}
//Create Transaction:
async function CreateTrans(child:Object,utxo,address:String,amount:Number) {
        const psbt = new bitcoin.Psbt({network:bitcoin.networks.testnet,maximumFeeRate:7000});
        var raw = await axios.get(`https://blockstream.info/testnet/api/tx/${utxo['txid']}/hex`)
        //Send funds from utxos
        psbt.addInput({
            hash : utxo.txid,
            index: utxo.vout,
            sequence: 0xffffffff, // These are defaults. This line is not needed.
            nonWitnessUtxo: Buffer.from(raw.data,'hex')
        })
        
        //Output taken from user
        psbt.addOutput({
        address: address, 
        value: amount}
        )

        psbt.signInput(0, child);
        //psbt.validateSignaturesOfInput(0, validator);
        psbt.finalizeAllInputs(true);
            
        //Extract transaction
        console.log("Extract transaction");
        var trans = psbt.extractTransaction().toHex()
        //console.log(trans)
        return trans;
        } 

//Using child wallets to send funds
async function SendFund(path,root,OutAddress,amount) {
    
    //var OutAddress = prompt("Enter receiver address: ")
    //var amount = parseInt(prompt("Enter amount: "),10);

    var trans = []
    var existingFunds = await AggregateChild(path,root);
    if (existingFunds['funds'] < amount) {
        return  'Insufficient Fund for transfering'
    } 
    else {
        for (let i=0; i < existingFunds['utxo'].length; i++) {
            var child = existingFunds['child'][i];
            var utxo = existingFunds['utxo'][i]; 
            var change = existingFunds['change_path'][i];

            //Debugging:
            console.log("child",child);
            console.log("utxo",utxo);
            console.log("change",change)

            if (amount >= utxo.value) {
                //Exhaust the fund from the child 
                amount -= utxo.value
                trans.push(await CreateTrans(child,utxo,OutAddress,utxo.value));
            }
            else {
                //Send the money to the receiver and send the change to the change wallet
                trans.push(await CreateTrans(child,utxo,OutAddress,amount));

                trans.push(await CreateTrans(child,utxo,getAddress(change,bitcoin.networks.testnet),utxo.value-amount))
                amount = 0 
                break
            }
            }
        }
        //Broadcasting transaction
        //console.log(trans)
        for (let i=0; i < trans.length; i++) {
            var upload = await axios.put('https://blockstream.info/testnet/api/tx',{trans});
            console.log(upload)
        }
    }




const main = async () => {
//Recovering the wallet
var mnemonic = 'abandon abandon abandon approve injury length abandon abandon abandon abandon abandon above'
var seed = mnemonicToSeedSync(mnemonic,'Jason')
//console.log(seed)
const root = bip32.fromSeed(seed)
assert(bip39.validateMnemonic(mnemonic));

//Sending funds to 3 child
var nums = [5,10,15]
for (let i = 0; i < nums.length; i++) {
    var path = `m/44'/1'/0'/0/${nums[i]}`
    var child = root.derivePath(path);
    var address = getAddress(child,bitcoin.networks.testnet);
    //console.log(address)

  }


  
console.log(await AggregateChild("m/44'/1'/0'/0/0",root))
console.log(await SendFund("m/44'/1'/0'/0/0",root,'tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt',1000000))
}
main()

/** 
const main = async () => {
var PastTrans = await axios.get(`https://blockstream.info/testnet/api/address/msXMiXJVSBC49mTmYmCMuRLN7NYTU61Kcp/utxo`)
console.log(PastTrans)
}
main()
*/