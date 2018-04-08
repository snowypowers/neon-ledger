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
const hw_transport_node_hid_1 = __importDefault(require("@ledgerhq/hw-transport-node-hid"));
const BIP44_1 = __importDefault(require("./BIP44"));
const ErrorCode_1 = __importDefault(require("./ErrorCode"));
class NeonLedger {
    /**
     * Initialises by listing devices and trying to find a ledger device connected. Throws an error if no ledgers detected or unable to connect.
     */
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            const supported = yield hw_transport_node_hid_1.default.isSupported();
            if (!supported) {
                throw new Error(`Your computer does not support the ledger!`);
            }
            const paths = yield NeonLedger.list();
            if (paths.length === 0) {
                throw new Error("USB Error: No device found.");
            }
            const ledger = new NeonLedger(paths[0]);
            return ledger.open();
        });
    }
    static list() {
        return __awaiter(this, void 0, void 0, function* () {
            return hw_transport_node_hid_1.default.list();
        });
    }
    constructor(path) {
        this.path = path;
    }
    /**
     * Opens an connection with the selected ledger.
     */
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.device = yield hw_transport_node_hid_1.default.open(this.path);
                return this;
            }
            catch (err) {
                throw evalTransportError(err);
            }
        });
    }
    /**
     * Closes the connection between the Ledger and the wallet.
     * @return {Promise<void>}}
     */
    close() {
        if (this.device) {
            return this.device.close();
        }
        return Promise.resolve();
    }
    /**
     * Retrieves the public key of an account from the Ledger.
     * @param {number} [acct] - Account that you want to retrieve the public key from.
     * @return {string} Public Key (Unencoded)
     */
    getPublicKey(acct = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.send("80040000", BIP44_1.default(acct), [
                ErrorCode_1.default.VALID_STATUS
            ]);
            return res.toString("hex").substring(0, 130);
        });
    }
    getDeviceInfo() {
        try {
            return this.device.device.getDeviceInfo();
        }
        catch (err) {
            throw evalTransportError(err);
        }
    }
    /**
     * Sends an message with params over to the Ledger.
     * @param {string} params - params as a hexstring
     * @param {string} msg - Message as a hexstring
     * @param {number[]} statusList - Statuses to return
     * @return {Promise<Buffer>} return value decoded to ASCII string
     */
    send(params, msg, statusList) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!params || params === null || params.length !== 8) {
                throw new Error(`params requires 4 bytes`);
            }
            const [cla, ins, p1, p2] = params
                .match(/.{1,2}/g)
                .map(i => parseInt(i, 16));
            try {
                return yield this.device.send(cla, ins, p1, p2, Buffer.from(msg, "hex"), statusList);
            }
            catch (err) {
                throw evalTransportError(err);
            }
        });
    }
    /**
     * Gets the ECDH signature of the data from Ledger using acct
     * @param {string} data
     * @param {number} [acct]
     * @return {Promise<string>}
     */
    getSignature(data, acct = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            data += BIP44_1.default(acct);
            let response = new Buffer("");
            const chunks = data.match(/.{1,510}/g) || [];
            if (!chunks.length) {
                throw new Error(`Invalid data provided: ${data}`);
            }
            for (let i = 0; i < chunks.length; i++) {
                const p = i === chunks.length - 1 ? "80" : "00";
                const chunk = chunks[i];
                const params = `8002${p}00`;
                try {
                    const res = yield this.send(params, chunk, [ErrorCode_1.default.VALID_STATUS]);
                    response = res;
                }
                catch (err) {
                    throw evalTransportError(err);
                }
            }
            if (response.readUIntBE(0, 2) === ErrorCode_1.default.VALID_STATUS) {
                throw new Error(`No more data but Ledger did not return signature!`);
            }
            return assembleSignature(response.toString("hex"));
        });
    }
}
exports.default = NeonLedger;
/**
 * Evaluates Transport Error thrown and rewrite the error message to be more user friendly.
 * @param {Error} err
 * @return {Error}
 */
const evalTransportError = (err) => {
    switch (err.statusCode) {
        case ErrorCode_1.default.APP_CLOSED:
            err.message = "Your NEO app is closed! Please login.";
            break;
        case ErrorCode_1.default.MSG_TOO_BIG:
            err.message = "Your transaction is too big for the ledger to sign!";
            break;
    }
    return err;
};
/**
 * The signature is returned from the ledger in a DER format
 * @param {string} response - Signature in DER format
 */
const assembleSignature = (response) => {
    const ss = new neon_js_1.u.StringStream(response);
    // The first byte is format. It is usually 0x30 (SEQ) or 0x31 (SET)
    // The second byte represents the total length of the DER module.
    ss.read(2);
    // Now we read each field off
    // Each field is encoded with a type byte, length byte followed by the data itself
    ss.read(1); // Read and drop the type
    const r = ss.readVarBytes();
    ss.read(1);
    const s = ss.readVarBytes();
    // We will need to ensure both integers are 32 bytes long
    const integers = [r, s].map(i => {
        if (i.length < 64) {
            i = "0".repeat(i.length - 64) + i;
        }
        if (i.length > 64) {
            i = i.substr(-64);
        }
        return i;
    });
    return integers.join("");
};
