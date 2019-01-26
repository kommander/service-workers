const EventTarget = require('../models/EventTarget');
const MessageChannel = require('../models/MessageChannel');

const Navigator = require('./models/Navigator');

class Window extends EventTarget {
  constructor(/* options */) {
    super();

    this.isServiceWorkerClientMock = true;
    this.navigator = new Navigator();
    this.MessageChannel = MessageChannel;
    this.matchMedia = () => ({ matches: true });
    this.self = this;
    this.window = this;
    this._loaded = false;
    this._addEventListener = this.addEventListener;
    this.addEventListener = (event, fn, opts) => {
      if (event.type === 'load' && this._loaded) {
        fn();
        return;
      }
      this._addEventListener(event, fn, opts);
    };
    this._dispatchEvent = this.dispatchEvent;
    this.dispatchEvent = (event, ...args) => {
      if (event.type === 'load') {
        if (this._loaded) {
          return;
        }

        this._loaded = true;
      }
      this._dispatchEvent(event, ...args);
    };
  }
}

function makeClientServiceWorkerEnv(options) {
  const mock = new Window(options);
  return mock;
}

function applyEnvMockToJSDOM(glb, options) {
  const mock = makeClientServiceWorkerEnv(options);

  Object.assign(glb, mock);

  glb.window.dispatchEvent = mock.dispatchEvent;
  glb.window.addEventListener = mock.addEventListener;
  glb.navigator.serviceWorker = mock.navigator.serviceWorker;
}

module.exports = {
  applyEnvMockToJSDOM,
  makeClientServiceWorkerEnv
};
