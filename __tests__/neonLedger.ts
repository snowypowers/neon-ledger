import { TransportStatusError } from "@ledgerhq/hw-transport";
import LedgerNode from "@ledgerhq/hw-transport-node-hid";
import { assembleSignature } from "../src/utils";
import neonLedger from "../src/neonLedger";

jest.mock("@ledgerhq/hw-transport-node-hid");
jest.mock("../src/utils", () => ({assembleSignature: jest.fn()}));

beforeEach(() => {
  jest.clearAllMocks();
});
describe("init", () => {
  test("isSupported", () => {
    neonLedger.init().then(_ => {
      expect(LedgerNode.isSupported).toBeCalled();
    });
  });

  test("Errors when not supported", done => {
    LedgerNode.isSupported.mockImplementationOnce(() => Promise.resolve(false));
    neonLedger
      .init()
      .then(_ => {
        done.fail("init is supposed to throw");
      })
      .catch(err => {
        expect(err.message).toMatch(/support/);
        done();
      });
  });
});

describe("open", () => {
  test("Returns self on success", async () => {
    const ledger = new neonLedger("path");
    const result = await ledger.open();
    expect(result).toBe(ledger);
  });

  test("Errors when app is closed", async () => {
    LedgerNode.open.mockImplementationOnce(() =>
      Promise.reject(new TransportStatusError(0x6e00))
    );
    const ledger = new neonLedger("path");
    try {
      await ledger.open();
    } catch (err) {
      expect(err.message).toMatch(/app is closed/);
    }
  });
});

describe("send", () => {
  let ledger;
  beforeEach(async () => {
    ledger = new neonLedger("path");
    await ledger.open();
  });

  test("Errors when insufficient params", async () => {
    try {
      const result = await ledger.send("00", "", []);
      expect(result).toBeNull();
    } catch (err) {
      expect(err.message).toMatch(/params/);
    }
  });

  test("Errors when nonhex params", async () => {
    try {
      const result = await ledger.send("qwqwqwqw", "", []);
      expect(result).toBeNull();
    } catch (err) {
      expect(err.message).toBeDefined();
    }
  });

  test("Errors when nonhex message", async () => {
    try {
      const result = await ledger.send("12345678", "qrew", []);
      expect(result).toBeNull();
    } catch (err) {
      expect(err.message).toBeDefined();
    }
  });

  test("Success", async () => {
    const mockFunction = jest.fn();
    ledger.device = {
      send: mockFunction
    };
    const result = await ledger.send("12345678", "ab", [0x1000]);
    expect(mockFunction).toBeCalledWith(
      18,
      52,
      86,
      120,
      Buffer.from("ab", "hex"),
      [0x1000]
    );
  });
});

describe("getPublicKey", () => {
  let ledger;
  beforeEach(async () => {
    ledger = new neonLedger("path");
  });

  test("Sends the correct message", async () => {
    const mockFn = jest.fn();
    mockFn.mockReturnValue(Buffer.from("02", "hex"));
    ledger.device = {
      send: mockFn
    };
    const expectedBIP =
      "8000002C" + "80000378" + "80000000" + "00000000" + "00000010";
    const result = await ledger.getPublicKey(16);
    expect(mockFn).toBeCalledWith(
      128,
      4,
      0,
      0,
      Buffer.from(expectedBIP, "hex"),
      [0x9000]
    );
    expect(result).toEqual("02");
  });
});

describe("getSignature", () => {
  let ledger;
  beforeEach(async () => {
    ledger = new neonLedger("path");
  });

  test("Errors when data too large", async () => {
    const mockFn = jest.fn();
    mockFn.mockRejectedValue(new TransportStatusError(0x6d08));
    ledger.device = {
      send: mockFn
    };
    try {
      const result = await ledger.getSignature("largeMsg", 0);
    } catch (err) {
      expect(err.message).toMatch(/too big/);
    }
  });

  test("Success", async () => {
    const mockFn = jest.fn();
    mockFn.mockResolvedValue(Buffer.from("3031", "hex"));
    ledger.device = {
      send: mockFn
    };
    const result = await ledger.getSignature("largeMsg", 0);
    expect(assembleSignature).toBeCalledWith("3031");

  });
});
