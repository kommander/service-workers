# sandbox-mock
Allows to test client and service worker at the same time.

## What?
If you want to make sure your client and service worker are communicating correctly,
you can have your client actually register a servie worker and start messaging.
To achieve this, the sandbox-mock will create a new vm context
and execute your worker in it.

# Example
Derived from the sanbox tests, this is the service worker:
```js
self.addEventListener('message', (event) => {
  if (event.data === 'hi') {
    event.ports[0].postMessage('Nice to meet you');
  }
});
```

And this is the test:
```js
// messaging.js
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
```