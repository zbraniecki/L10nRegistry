require('babel-register')({
  plugins: ['transform-es2015-modules-commonjs']
});

const locales = [
  'pl',
  'en-US',
//  'en'
];
const resIds = [
  '/browser/main.ftl',
  '/browser/menu.ftl',
  '/brand/brand.ftl',
  '/toolkit/common.ftl',
  '/toolkit/widgets.ftl',
  '/browser/test.ftl',
];

const platformData = {
  'gre/localization/en-US/toolkit/widgets.ftl': 'key = Value',
  'gre/localization/en-US/toolkit/common.ftl': 'key = Common Value'
};

const appData = {
  '/localization/en-US/brand/brand.ftl': 'key = Brand',
  '/localization/en-US/browser/main.ftl': 'key = Main Value',
  '/localization/en-US/browser/menu.ftl': 'key = Menu',
  '/localization/en-US/browser/test.ftl': 'key = Test'
};



const L10nRegistry = require('../lib/main').L10nRegistry;
const FileSource = require('../lib/main').FileSource;

const platformFileSource = new FileSource('platform', 'gre/localization/{locale}');
const appFileSource = new FileSource('app', '/localization/{locale}');

platformFileSource.fs = platformData;
appFileSource.fs = appData;

L10nRegistry.registerSource(platformFileSource);
L10nRegistry.registerSource(appFileSource);

let res = L10nRegistry.getResources(locales, resIds);

for (let resBundle of res) {
  console.log(resBundle);
}
