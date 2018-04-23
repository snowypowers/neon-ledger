export default function(acct: number = 0): string {
  if (acct < 0) {
    throw new Error(`Number cannot be negative!`);
  }
  if (acct % 1 > 0) {
    throw new Error(`Expected an integer!`);
  }
  const acctNumber = acct.toString(16);
  return (
    "8000002C" +
    "80000378" +
    "80000000" +
    "00000000" +
    "0".repeat(8 - acctNumber.length) +
    acctNumber
  );
}
