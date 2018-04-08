import { tx } from "@cityofzion/neon-js";
import NeonLedger from "./neonLedger";
export default NeonLedger;
export declare const getPublicKey: (acct?: number) => Promise<string>;
export declare const getDeviceInfo: () => Promise<string>;
/**
 * Signs a transaction with Ledger. Returns the whole transaction string
 * @param {Transaction|string} unsignedTx - hexstring or Transaction object
 * @param {number} acct - The account to sign with.
 * @return {string} Transaction as a hexstring.
 */
export declare const signWithLedger: (unsignedTx: string | tx.Transaction, acct?: number) => Promise<string>;
export declare const legacySignWithLedger: (unsignedTx: string | tx.Transaction, publicKeyEncoded: string, acct?: number) => Promise<string>;
