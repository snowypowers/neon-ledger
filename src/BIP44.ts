export default function(acct: number = 0): string {
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
