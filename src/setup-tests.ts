import fetchMockJest from 'fetch-mock-jest'; // eslint-disable-line import/no-extraneous-dependencies

beforeEach(() => {
  expect.hasAssertions();
});

afterEach(() => {
  fetchMockJest.restore();
});
