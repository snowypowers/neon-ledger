import { tx, u, wallet } from "@cityofzion/neon-js";
import { TransportStatusError } from "@ledgerhq/hw-transport";
import LedgerNode from "@ledgerhq/hw-transport-node-hid";
import BIP44 from "./BIP44";
import ErrorCode from "./ErrorCode";
import { assembleSignature } from "./utils";

export default class NeonLedger {
  /**
   * Initialises by listing devices and trying to find a ledger device connected. Throws an error if no ledgers detected or unable to connect.
   */
  public static async init(): Promise<NeonLedger> {
    const supported = await LedgerNode.isSupported();
    if (!supported) {
      throw new Error(`Your computer does not support the ledger!`);
    }
    const paths = await NeonLedger.list();
    if (paths.length === 0) {
      throw new Error("USB Error: No device found.");
    }
    const ledger = new NeonLedger(paths[0]);
    return ledger.open();
  }

  public static async list(): Promise<string[]> {
    return LedgerNode.list();
  }

  public path: string;
  public device?: LedgerNode;

  constructor(path: string) {
    this.path = path;
  }

  /**
   * Opens an connection with the selected ledger.
   */
  public async open(): Promise<NeonLedger> {
    try {
      this.device = await LedgerNode.open(this.path);
      return this;
    } catch (err) {
      throw evalTransportError(err);
    }
  }

  /**
   * Closes the connection between the Ledger and the wallet.
   * @return {Promise<void>}}
   */
  public close(): Promise<void> {
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
  public async getPublicKey(acct: number = 0): Promise<string> {
    const res = await this.send("80040000", BIP44(acct), [
      ErrorCode.VALID_STATUS
    ]);
    return res.toString("hex").substring(0, 130);
  }

  public getDeviceInfo(): string {
    try {
      return this.device!.device.getDeviceInfo();
    } catch (err) {
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
  public async send(
    params: string,
    msg: string,
    statusList: number[]
  ): Promise<Buffer> {
    if (!params || params === null || params.length !== 8) {
      throw new Error(`params requires 4 bytes`);
    }
    const [cla, ins, p1, p2] = params
      .match(/.{1,2}/g)!
      .map(i => parseInt(i, 16));
    try {
      return await this.device!.send(
        cla,
        ins,
        p1,
        p2,
        Buffer.from(msg, "hex"),
        statusList
      );
    } catch (err) {
      throw evalTransportError(err);
    }
  }

  /**
   * Gets the ECDH signature of the data from Ledger using acct
   * @param {string} data
   * @param {number} [acct]
   * @return {Promise<string>}
   */
  public async getSignature(data: string, acct: number = 0): Promise<string> {
    data += BIP44(acct);
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
        const res = await this.send(params, chunk, [ErrorCode.VALID_STATUS]);
        response = res;
      } catch (err) {
        throw evalTransportError(err);
      }
    }
    if (response.readUIntBE(0, 2) === ErrorCode.VALID_STATUS) {
      throw new Error(`No more data but Ledger did not return signature!`);
    }
    return assembleSignature(response.toString("hex"));
  }
}

/**
 * Evaluates Transport Error thrown and rewrite the error message to be more user friendly.
 * @param {Error} err
 * @return {Error}
 */
const evalTransportError = (err: TransportStatusError): Error => {
  switch (err.statusCode) {
    case ErrorCode.APP_CLOSED:
      err.message = "Your NEO app is closed! Please login.";
      break;
    case ErrorCode.MSG_TOO_BIG:
      err.message = "Your transaction is too big for the ledger to sign!";
      break;
    case ErrorCode.TX_DENIED:
      err.message = "Transaction signing denied";
      break;
  }
  return err;
};
