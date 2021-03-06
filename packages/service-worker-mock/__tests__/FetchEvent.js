const makeServiceWorkerEnv = require('../index');
const FetchEvent = require('../models/FetchEvent');

describe('FetchEvent', () => {
  it('should construct with Request', () => {
    Object.assign(global, makeServiceWorkerEnv());

    const request = new Request('/test');
    const event = new FetchEvent('fetch', { request });

    expect(event.request.url).toEqual('https://www.test.com/test');
  });

  it('should construct with string', () => {
    Object.assign(global, makeServiceWorkerEnv());

    const request = '/test';
    const event = new FetchEvent('fetch', { request });

    expect(event.request.url).toEqual('https://www.test.com/test');
  });
});
