"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeRecords = void 0;
const writeRecords = async (walletData, signatureRequests) => {
    var fs = require("fs");
    fs.writeFileSync('data/signature_requests.json', JSON.stringify(signatureRequests));
};
exports.writeRecords = writeRecords;
//# sourceMappingURL=Utils.js.map