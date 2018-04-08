"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const neon_js_1 = require("@cityofzion/neon-js");
const neonLedger_1 = __importDefault(require("./neonLedger"));
exports.default = neonLedger_1.default;
exports.getPublicKey = (acct = 0) => __awaiter(this, void 0, void 0, function* () {
    const ledger = yield neonLedger_1.default.init();
    try {
        return yield ledger.getPublicKey(acct);
    }
    finally {
        yield ledger.close();
    }
});
exports.getDeviceInfo = () => __awaiter(this, void 0, void 0, function* () {
    const ledger = yield neonLedger_1.default.init();
    try {
        return yield ledger.getDeviceInfo();
    }
    finally {
        yield ledger.close();
    }
});
/**
 * Signs a transaction with Ledger. Returns the whole transaction string
 * @param {Transaction|string} unsignedTx - hexstring or Transaction object
 * @param {number} acct - The account to sign with.
 * @return {string} Transaction as a hexstring.
 */
exports.signWithLedger = (unsignedTx, acct = 0) => __awaiter(this, void 0, void 0, function* () {
    const ledger = yield neonLedger_1.default.init();
    try {
        const data = typeof unsignedTx !== "string"
            ? neon_js_1.tx.serializeTransaction(unsignedTx, false)
            : unsignedTx;
        const publicKey = yield ledger.getPublicKey(acct);
        const invocationScript = "40" + (yield ledger.getSignature(data, acct));
        const verificationScript = neon_js_1.wallet.getVerificationScriptFromPublicKey(publicKey);
        const txObj = neon_js_1.tx.deserializeTransaction(data);
        txObj.scripts.push({ invocationScript, verificationScript });
        return neon_js_1.tx.serializeTransaction(txObj);
    }
    finally {
        yield ledger.close();
    }
});
exports.legacySignWithLedger = (unsignedTx, publicKeyEncoded, acct = 0) => __awaiter(this, void 0, void 0, function* () {
    const ledger = yield neonLedger_1.default.init();
    try {
        const data = typeof unsignedTx !== "string"
            ? neon_js_1.tx.serializeTransaction(unsignedTx, false)
            : unsignedTx;
        const invocationScript = "40" + (yield ledger.getSignature(data, acct));
        const verificationScript = neon_js_1.wallet.getVerificationScriptFromPublicKey(publicKeyEncoded);
        const txObj = neon_js_1.tx.deserializeTransaction(data);
        txObj.scripts.push({ invocationScript, verificationScript });
        return neon_js_1.tx.serializeTransaction(txObj);
    }
    finally {
        yield ledger.close();
    }
});
