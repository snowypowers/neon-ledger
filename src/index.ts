import { tx, wallet } from "@cityofzion/neon-js";
import NeonLedger from "./neonLedger";

export default NeonLedger;

export const getPublicKey = async (acct: number = 0): Promise<string> => {
  const ledger = await NeonLedger.init();
  try {
    return await ledger.getPublicKey(acct);
  } finally {
    await ledger.close();
  }
};

export const getDeviceInfo = async () => {
  const ledger = await NeonLedger.init();
  try {
    return await ledger.getDeviceInfo();
  } finally {
    await ledger.close();
  }
};

/**
 * Signs a transaction with Ledger. Returns the whole transaction string
 * @param {Transaction|string} unsignedTx - hexstring or Transaction object
 * @param {number} acct - The account to sign with.
 * @return {string} Transaction as a hexstring.
 */
export const signWithLedger = async (
  unsignedTx: tx.Transaction | string,
  acct: number = 0
): Promise<string> => {
  const ledger = await NeonLedger.init();
  try {
    const data =
      typeof unsignedTx !== "string"
        ? tx.serializeTransaction(unsignedTx, false)
        : unsignedTx;
    const publicKey = await ledger.getPublicKey(acct);
    const invocationScript = "40" + (await ledger.getSignature(data, acct));
    const verificationScript = wallet.getVerificationScriptFromPublicKey(
      publicKey
    );
    const txObj = tx.deserializeTransaction(data);
    txObj.scripts.push({ invocationScript, verificationScript });
    return tx.serializeTransaction(txObj);
  } finally {
    await ledger.close();
  }
};

export const legacySignWithLedger = async (
  unsignedTx: tx.Transaction | string,
  publicKeyEncoded: string,
  acct: number = 0
): Promise<string> => {
  const ledger = await NeonLedger.init();
  try {
    const data =
      typeof unsignedTx !== "string"
        ? tx.serializeTransaction(unsignedTx, false)
        : unsignedTx;
    const invocationScript = "40" + (await ledger.getSignature(data, acct));
    const verificationScript = wallet.getVerificationScriptFromPublicKey(
      publicKeyEncoded
    );
    const txObj = tx.deserializeTransaction(data);
    txObj.scripts.push({ invocationScript, verificationScript });
    return tx.serializeTransaction(txObj);
  } finally {
    await ledger.close();
  }
};
