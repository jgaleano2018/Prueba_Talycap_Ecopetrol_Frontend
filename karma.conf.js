// Karma config para Angular 20 con el builder `@angular/build:karma`.
//
// Nota: el builder moderno ya inyecta el plugin de Angular internamente, por lo
// que NO se declara `@angular-devkit/build-angular/plugins/karma` (no existe en
// esta versión y produciría un MODULE_NOT_FOUND).
//
// Ejecuta los tests unitarios en Chrome headless, apto para CI.

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: {
        random: false,
      },
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/prueba-talycap-ecopetrol-frontend'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }],
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      // --no-sandbox es necesario para correr Chrome headless dentro de CI.
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    restartOnFileChange: true,
    singleRun: false,
  });
};
