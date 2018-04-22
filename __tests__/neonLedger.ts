import { TransportStatusError } from "@ledgerhq/hw-transport";
import LedgerNode from "@ledgerhq/hw-transport-node-hid";
import neonLedger from "../src/neonLedger";

jest.mock("@ledgerhq/hw-transport-node-hid");

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
  test("app is closed", async () => {
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
