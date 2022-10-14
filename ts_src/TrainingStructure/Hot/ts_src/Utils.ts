
import { SignatureRequest } from "./SignatureRequest";


export const writeRecords = async (walletData?, signatureRequests?: { preimage: string, signatureRequests: SignatureRequest[] }) => {

    var fs = require("fs")
    fs.writeFileSync('data/signature_requests.json', JSON.stringify(signatureRequests))

}