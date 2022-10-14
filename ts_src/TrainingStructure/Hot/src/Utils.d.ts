import { SignatureRequest } from "./SignatureRequest";
export declare const writeRecords: (walletData?: any, signatureRequests?: {
    preimage: string;
    signatureRequests: SignatureRequest[];
}) => Promise<void>;
