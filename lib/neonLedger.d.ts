/// <reference types="node" />
import LedgerNode from "@ledgerhq/hw-transport-node-hid";
export default class NeonLedger {
    /**
     * Initialises by listing devices and trying to find a ledger device connected. Throws an error if no ledgers detected or unable to connect.
     */
    static init(): Promise<NeonLedger>;
    static list(): Promise<string[]>;
    path: string;
    device?: LedgerNode;
    constructor(path: string);
    /**
     * Opens an connection with the selected ledger.
     */
    open(): Promise<NeonLedger>;
    /**
     * Closes the connection between the Ledger and the wallet.
     * @return {Promise<void>}}
     */
    close(): Promise<void>;
    /**
     * Retrieves the public key of an account from the Ledger.
     * @param {number} [acct] - Account that you want to retrieve the public key from.
     * @return {string} Public Key (Unencoded)
     */
    getPublicKey(acct?: number): Promise<string>;
    getDeviceInfo(): string;
    /**
     * Sends an message with params over to the Ledger.
     * @param {string} params - params as a hexstring
     * @param {string} msg - Message as a hexstring
     * @param {number[]} statusList - Statuses to return
     * @return {Promise<Buffer>} return value decoded to ASCII string
     */
    send(params: string, msg: string, statusList: number[]): Promise<Buffer>;
    /**
     * Gets the ECDH signature of the data from Ledger using acct
     * @param {string} data
     * @param {number} [acct]
     * @return {Promise<string>}
     */
    getSignature(data: string, acct?: number): Promise<string>;
}
