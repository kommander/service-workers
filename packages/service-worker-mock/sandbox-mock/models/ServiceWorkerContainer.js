const EventTarget = require('../../models/EventTarget');
const ServiceWorker = require('./ServiceWorker');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

class ServiceWorkerContainer extends EventTarget {
  constructor() {
    super();

    this._onmessage = null;
    Object.defineProperty(this, 'onmessage', {
      enumerable: true,
      set: (handler) => {
        this._onmessage = handler;
        this.addEventListener('message', handler);
      },
      get: () => this._onmessage
    });

    this._oncontrollerchange = null;
    Object.defineProperty(this, 'oncontrollerchange', {
      enumerable: true,
      set: (handler) => {
        this._oncontrollerchange = handler;
        this.addEventListener('controllerchange', handler);
      },
      get: () => this._oncontrollerchange
    });

    this.resetReadyPromise();
    this.controller = null;
    this._registration = null;
    this._registrations = [];
  }

  resetReadyPromise() {
    this.ready = new Promise((resolve) => {
      this._readyResolve = resolve;
    });
  }

  async register(swPath) {
    if (!path.isAbsolute(swPath)) {
      swPath = path.resolve(process.cwd(), swPath);
    }
    const setupScriptPath = path.resolve(__dirname, '../sandbox/setup-context.js');
    const dirname = path.parse(setupScriptPath).dir;
    const code = fs.readFileSync(setupScriptPath);
    const swContext = {
      console,
      process,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      JSON,
      Buffer
    };

    swContext.global = swContext;

    const sandbox = vm.createContext(swContext, {
      name: 'ServiceWorker Mock Context'
    });

    const worker = new ServiceWorker(swPath, sandbox);
    const skipWaiting = async () => {
      worker.state = 'activating';
      await sandbox.trigger('activate');
      registration.waiting = null;
      registration.active = worker;
      worker.state = 'activated';
      worker.dispatchEvent({ type: 'statechange' });
      this._readyResolve(registration);
      this.resetReadyPromise();
    };

    vm.runInContext(code, sandbox, {
      filename: setupScriptPath
    })(
      swPath,
      skipWaiting,
      sandbox,
      dirname,
      require
    );

    const registration = sandbox.registration;

    this._registration = registration;
    this._registrations.push(registration);
    registration.installing = worker;

    Promise.resolve()
      .then(() => {})
      .then(async () => {
        if (typeof registration.onupdatefound === 'function') {
          registration.onupdatefound();
        }

        await sandbox.trigger('install');
        registration.installing = null;
        registration.waiting = worker;
        worker.state = 'installed';
        if (this.controller) {
          this.controller.state = 'redundant';
          this.controller.dispatchEvent({ type: 'statechange' });
        }
        this.controller = worker;
        this.dispatchEvent({ type: 'controllerchange' });
        worker.dispatchEvent({ type: 'statechange' });

        if (!registration.active) {
          skipWaiting();
        }
      });

    return registration;
  }

  getRegistration() {
    return Promise.resolve(this._registration);
  }

  getRegistrations() {
    return this._registrations;
  }

  startMessages() {
    // noop
  }
}

module.exports = ServiceWorkerContainer;
