// const fs = require('fs');
// const { transformSync } = require('@babel/core');
const makeServiceWorkerEnv = require('../../index');

// TODO: Maybe use jest transforms
// eslint-disable-next-line node/no-deprecated-api
// require.extensions['.js'] = (mod, modulePath) => {
//   let content = fs.readFileSync(modulePath);
//   if (!/node_modules|babel.config/.test(modulePath)) {
//     content = transformSync(content).code;
//   }
//   mod.compile(content);
// };

module.exports = (swPath, skipWaiting) => {
  const swEnv = makeServiceWorkerEnv();
  Object.assign(swEnv, {
    skipWaiting
  });
  Object.assign(global, swEnv);
  require(swPath);
};
