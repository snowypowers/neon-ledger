import { u } from "@cityofzion/neon-js";

/**
 * The signature is returned from the ledger in a DER format
 * @param {string} response - Signature in DER format
 */
export const assembleSignature = (response: string): string => {
  const ss = new u.StringStream(response);
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
