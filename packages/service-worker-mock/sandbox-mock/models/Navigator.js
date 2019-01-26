const ServiceWorkerContainer = require('./ServiceWorkerContainer');

class Navigator {
  constructor() {
    this.onLine = true;
    this.userAgent = 'Chrome Mock';
    this.serviceWorker = new ServiceWorkerContainer();
  }
}

module.exports = Navigator;
