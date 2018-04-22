const mock = jest.genMockFromModule("@ledgerhq/hw-transport-node-hid").default;

mock.isSupported = jest.fn(() => {
  return Promise.resolve(true);
});

mock.list = jest.fn(() => {
  return Promise.resolve(["path1"]);
});

mock.open = jest.fn((path: string) => {
  return { path };
});


export default mock;
