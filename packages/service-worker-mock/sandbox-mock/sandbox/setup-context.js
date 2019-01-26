
// eslint-disable-next-line no-unused-expressions
(swPath, skipWaiting, sandbox, __dirname, nativeRequire) => {
  const Module = nativeRequire('module');
  const path = nativeRequire('path');
  const vm = nativeRequire('vm');
  const fs = nativeRequire('fs');
  const nativeConsole = nativeRequire('console');
  const moduleCache = {};
  const swRequire = (modulePath) => {
    if (moduleCache[modulePath]) {
      return moduleCache[modulePath].exports;
    }

    if (Module.builtinModules.includes(modulePath)) {
      return nativeRequire(modulePath);
    }

    const dirname = path.parse(modulePath).dir;
    const filename = path.parse(modulePath).base;
    const extension = path.parse(modulePath).ext;
    const scopedSWRequire = (subPath) => {
      const subModulePath = path.isAbsolute(subPath) || !/^\.\.?\//.test(subPath)
        ? nativeRequire.resolve(subPath)
        : nativeRequire.resolve(path.join(dirname, subPath));

      return swRequire(subModulePath);
    };
    scopedSWRequire.extensions = swRequire.extensions;

    const mod = {
      exports: {},
      compile(content) {
        const moduleCode = `((require, module, exports, __dirname, __filename) => {${content}})`;

        vm.runInContext(moduleCode, sandbox, {
          filename: modulePath
        })(scopedSWRequire, mod, mod.exports, dirname, filename);
      }
    };

    moduleCache[modulePath] = mod;

    try {
      swRequire.extensions[extension](mod, modulePath);
    } catch (err) {
      nativeConsole.error(err);
      throw err;
    }

    return mod.exports;
  };
  swRequire.extensions = {
    '.js': (mod, modulePath) => {
      const content = fs.readFileSync(modulePath);
      mod.compile(content);
    },
    '.json': (mod, modulePath) => {
      mod.exports = JSON.parse(fs.readFileSync(modulePath));
    }
  };

  swRequire(path.join(__dirname, './setup-sw.js'))(swPath, skipWaiting);
};
