declare module "@ledgerhq/hw-transport-node-hid" {
  import Transport from "@ledgerhq/hw-transport";
  import HID from "node-hid";
  export default class TransportNodeHid extends Transport<string> {
    device: HID.HID;
    ledgerTransport: boolean;
    timeout: number;
    debug: boolean;
    exchangeStack: Array<any>;

    constructor(
      device: HID.HID,
      ledgerTransport?: boolean,
      timeout?: number,
      debug?: boolean
    );

    static isSupported(): Promise<boolean>;
    static list(): Promise<string[]>;
    static open(path: string): Promise<TransportNodeHid>;

    exchange(apdu: Buffer): Promise<Buffer>;
    close(): Promise<void>;
  }
}
