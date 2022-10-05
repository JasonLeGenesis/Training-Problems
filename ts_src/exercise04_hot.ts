const ethers = require("ethers");
import { Network, Alchemy, Utils } from 'alchemy-sdk';



// Set up 

const settings = {
  apiKey: 'YhzzElLVr_4SsBK62rqoa_Ay2YAUBt27', 
  network: Network.ETH_GOERLI 
};

const alchemy = new Alchemy(settings);


var transaction = {
  //Hard coded
  to: "0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d",
  value: 200,
  gasPrice: 30000,
  nonce: 3,
  gasLimit: 75000,

}



function WriteTransaction() {
  const fs = require('fs')
  fs.writeFileSync('ts_src/Transactions/Unsigned.json', JSON.stringify(transaction));
  /** 
  
  
  var serializedTx = serialize(transaction);
  var hashedTx = keccak256(serializedTx)
  output['HashedTx'] = hashedTx
  output['SerializedTx'] = serializedTx 
  fs.writeFileSync('ts_src/Transactions/Unsigned.json', JSON.stringify(output));
  */
}

async function BroadcastTransaction() {
  const fs = require('fs')
    var signed = fs.readFileSync("ts_src/Transactions/Signed.json");
    signed = JSON.parse(signed);

    
    
    //transaction["from"] = signed.xpub;
    console.log(transaction)
    var signature = {
      r: signed["r"],
      s: signed["s"],
      v: signed["v"],
    };
    console.log(signature)
    //var mashedTrans = ethers.utils.serializeTransaction(transaction,signature);
    
    //console.log(mashedTrans)
    //var transasignedTransaction = signed["signed"]
    //var xpub = signed["xpub"]
    //console.log(signedTransaction)
    
    
    let tx = await alchemy.core.sendTransaction(signed['rawTransaction']);
    console.log("Sent transaction", tx);
   
    }
const main = async () => {
//Get transaction
//var tx = await alchemy.core.getBlock(alchemy.core.getBlockNumber());
//console.log(wallet.address)

var args = process.argv;
if (args.length > 2 ) {
  if (args.includes('--writeTransaction')) {
    WriteTransaction()
  }
  else if (args.includes("--broadcastTransaction")) {
    
    BroadcastTransaction()
  } 
  
}






}
main()