
from bip_utils import Bip39SeedGenerator, Bip32Slip10Secp256k1
import eth_account
from eth_account.messages import encode_defunct
import json 

class Cold:
    def __init__(self, profile_id: str, mnemonic: str=""):
        self.profile_id = profile_id
        self.PrivateKey = None
        self.mnemonic = mnemonic

    def generate_private_key(self, path: str, salt: str = "") -> str:
        """
        Generates a private key at a given path

        :param path: BIP-44-like HD wallet path
        :param salt: passphrase for added protection or separation for HD wallet keys
        :return: secret key data at the given path of the HD wallet
        """
        seed_bytes = Bip39SeedGenerator(self.mnemonic).Generate(salt)
        child = Bip32Slip10Secp256k1.FromSeedAndPath(seed_bytes, path)
        
        return child.PrivateKey().Raw().ToHex()

    def generate_public_key(self, path: str, salt: str = "") -> str:
        """
        Generates a public key at a given path
        :param path: BIP-44-like HD wallet path
        :param salt: passphrase for added protection or separation for HD wallet keys
        :return: public key data at the given path of the HD wallet
        """
        seed_bytes = Bip39SeedGenerator(self.mnemonic).Generate(salt)
        child = Bip32Slip10Secp256k1.FromSeedAndPath(seed_bytes, path)
        return child.PrivateKey().PublicKey().RawCompressed().ToHex()


    def generate_xprv(self, path: str, salt: str = "") -> str:
        """
        Generates an extended private key at a given path

        :param path: BIP-44-like HD wallet path
        :param salt: passphrase for added protection or separation for HD wallet keys
        :return: bech32-encoded private key data at the given path of the HD wallet that further derive private keys
        """
        seed_bytes = Bip39SeedGenerator(self.mnemonic).Generate(salt)
        child = Bip32Slip10Secp256k1.FromSeedAndPath(seed_bytes, path)
        return child.PrivateKey().ToExtended()

    def generate_xpub(self, path: str, salt: str = "") -> str:
        """
        Generates an extended public key at a given path

        :param path: BIP-44-like HD wallet path
        :param salt: passphrase for added protection or separation for HD wallet keys
        :return: bech32-encoded public key data at the given path of the HD wallet that further derive public keys
        """

        seed_bytes = Bip39SeedGenerator(self.mnemonic).Generate(salt)
        child = Bip32Slip10Secp256k1.FromSeedAndPath(seed_bytes, path)
        return child.PublicKey().ToExtended()
    def sign(self, private_key: str, message: str) -> str:
        """
        Signs a message using the appropriate algorithm for the coin

        :param private_key: secret key used to produce cryptographic signature
        :param message: data that is to be signed
        :return: signature as r and s concatenated as a string
        """
        signed = eth_account.Account.from_key(private_key).signHash(message)
        print(signed)
        return signed.signature.hex()

    def generate_cold_mnemonic() -> str:
        """
        Create the base mnemonic to be securely stored. This mnemonic will be used to derive all keys and addresses.

        :return: Twenty-four word mnemonic phrase.
        """
        # if a valid mnemonic exists at file path, read and return it
    
        return True

if __name__ == "__main__" : 
#Initialize Cold Wallet 
    Account = Cold(profile_id=12345)
    path = "m/44'/60'/0'/0/0"
    #Getting mnemonic

with open('Cold/data.txt') as f:
    Account.mnemonic = f.readlines()[0]

print("PrivateKey:",Account.generate_private_key(path))
print("PublicKey:",Account.generate_public_key(path))
print("XPubKey",Account.generate_xpub(path))
#print("Signature:",Account.sign(Account.generate_private_key("m/44'/60'/0'/0/0"),"bd8b53d594dd2900b96ad307de3af0619a3819522769a8ba32ffc44535208450"))


#Signing message
#Change directory
file_path = '/Users/jason/Desktop/Jason_Training/blockchain-training/Training Problems/ts_src/TrainingStructure/Hot/data/'
with open(file_path+'signature_requests.json', 'r') as f:
    data = json.load(f)
f.close()

message_hash = data['signatureRequests'][0]['message']
signature = Account.sign(Account.generate_private_key(path),message_hash)

print("Signature",signature)
#Write signature
Output = {}
SignatureResponse = {
    'publicKey': Account.generate_public_key(path),
    'path' : path,
    'curve' : data['signatureRequests'][0]['curve'],
    'signature' : signature
}
Output['preimage'] = data['preimage']
Output['signatureResponse'] = [SignatureResponse]


with open(file_path+'signature_response.json', 'w') as output:
 json.dump(Output,output)
output.close()
