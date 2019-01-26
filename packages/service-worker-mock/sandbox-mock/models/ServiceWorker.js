const MessageEvent = require('../../models/MessageEvent');
const MessagePort = require('../../models/MessagePort');
const EventTarget = require('../../models/EventTarget');

class ServiceWorker extends EventTarget {
  constructor(scriptURL, context) {
    super();

    this.context = context;
    this.scriptURL = scriptURL;
    this.state = 'installing';

    this._onstatechange = null;
    Object.defineProperty(this, 'onstatechange', {
      enumerable: true,
      set: (handler) => {
        this._onstatechange = handler;
        this.addEventListener('statechange', handler);
      },
      get: () => this._onstatechange
    });
  }

  postMessage(message, transfer = []) {
    const ports = transfer.filter(objOrPort => (objOrPort instanceof MessagePort));
    const event = new MessageEvent('message', {
      data: message,
      ports
    });
    this.context.self.dispatchEvent(event);
  }
}

module.exports = ServiceWorker;
