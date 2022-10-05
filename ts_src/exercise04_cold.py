import eth_account
from web3 import Web3
from eth_account import Account
from eth_account.signers.local import LocalAccount
from web3.auto import w3
import json 
from bip32 import BIP32, HARDENED_INDEX
import binascii
from bip_utils import Bip39SeedGenerator, Bip32Slip10Secp256k1

#Construct output:
Output = {}
#Get seed from mnemonic
mnemonic =  "grief bone property enact finger panic speed borrow mobile limb caution settle"
seed_bytes = Bip39SeedGenerator(mnemonic).Generate()

# Construct from seed, derivation path returned: m
bip32_ctx = Bip32Slip10Secp256k1.FromSeed(seed_bytes)
# Print master key in extended format
print(bip32_ctx.PrivateKey().ToExtended())
#Create child 
child = Bip32Slip10Secp256k1.FromSeedAndPath(seed_bytes, "m/44'/60'/0'/0/0")
print("PrivateKey:", child.PrivateKey().Raw())

#Output["xpub"] = child.PublicKey().ToExtended()
#privateKey = "0x16d7d0e6c222d384ac995de66ebdfc9daef75c95ad23f02dd7033e444e84020f"
LocalAcc = w3.eth.account.from_key(child.PrivateKey().Raw().ToBytes())
print("Address:", LocalAcc.address)
#Derivation path: m’/44’/1’/0’/0
#tx = {"to":"0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d","value":1,"nonce":0,"gas":400,"gasPrice":500}





f = open("ts_src/Transactions/Unsigned.json")
data = json.load(f)
f.close()
#string = json.dumps(data)
#tx = json.loads(string)
#web3.utils.toChecksumAddress('0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d')
data['gas'] = data.pop('gasLimit')
signed = LocalAcc.signTransaction(data)
print(signed)

Output["rawTransaction"] = signed.rawTransaction.hex()
Output["s"] = str(signed.s)
Output["r"] = str(signed.r)
Output["v"] = signed.v
#print(LocalAcc.xpub)

print(Output)
with open('ts_src/Transactions/Signed.json', 'w') as output:
 json.dump(Output,output)

"""
"SignedTransaction(rawTransaction=HexBytes('0xf85f808082012c94c1912fee45d61c87cc5ea59dae31190fffff232d01801ba0ec749e1ed0ff314d4e43c5ec9a3832a1d41952763715ac9d48fc501795690699a051791a20d261745fb31c200084a0ddbaaa0996bd713c48c45a12ea0e1005a93d'), 
hash=HexBytes('0x7aa7efcd7a92147568503f2c2278fd60449627e424b1308002861a9b7a733220'), 
r=106951877831896289969742942692382688713903780742313130298576757067669981169305, 
s=36851309560361743607039391133298640947065670586839088474707646092043660667197, 
v=27)"



"""
"""
With TX 
SignedMessage(messageHash=HexBytes('0xdf02820bb88094c1912fee45d61c87cc5ea59dae31190fffff232d0180808080'), 
r=20165100420167272113478924937194007388558256113655112908263989043492897506204, 
s=8415803462399122019778352375336607107753319958602041628469922109207568227009, 
v=28, 
signature=HexBytes('0x2c950ad913bf6a39cf029ef448d3c5bea8bd22af73e250c5663af345eccd439c129b2d0ba835f3137bbab14d525331d9f7b29d8b40c3e41c0ebec4e1f4ec9ac11c'))
"""

