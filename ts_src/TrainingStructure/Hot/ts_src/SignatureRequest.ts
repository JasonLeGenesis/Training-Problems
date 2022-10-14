export interface SignatureRequest {
    message: string;
    publicKey: string;
    path: string;
    curve: string;
}