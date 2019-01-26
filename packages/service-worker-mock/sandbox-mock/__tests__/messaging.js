const { makeClientServiceWorkerEnv } = require('../index');
const path = require('path');

describe('Sandbox Messaging', () => {
  beforeEach(() => {
    Object.assign(global, makeClientServiceWorkerEnv());
    jest.resetModules();
  });

  it('can post a message', (done) => {
    navigator.serviceWorker.ready.then(registration => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        expect(event.data).toEqual('Nice to meet you');
        done();
      };
      registration.active.postMessage('hi', [channel.port2]);
    });

    const swPath = path.resolve(__dirname, 'fixtures/sw.js');
    navigator.serviceWorker.register(swPath);
  });
});
