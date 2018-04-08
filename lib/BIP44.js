"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(acct = 0) {
    const acctNumber = acct.toString(16);
    return ("8000002C" +
        "80000378" +
        "80000000" +
        "00000000" +
        "0".repeat(8 - acctNumber.length) +
        acctNumber);
}
exports.default = default_1;
