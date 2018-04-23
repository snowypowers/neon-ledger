import BIP44 from '../src/BIP44'

test('Produces a BIP44 compatible string', () => {
  const result = BIP44();
  expect(result.length).toBe(40)
})

test('Produces a string with the correct account number', () => {
  const cases = [0,1,10,100,123456]
  cases.map((c) => {
    const result = BIP44(c)
    const acctSlice = result.substr(32,8)
    const parsedResult = parseInt(acctSlice, 16)
    expect(parsedResult).toBe(c)
  })
})

test('Errors when given negative number', () => {
  expect(() => BIP44(-1)).toThrow(/cannot be negative/)
})

test('Errors when given non-integer', () => {
  expect(() => BIP44(1.1)).toThrow(/integer/)
})
