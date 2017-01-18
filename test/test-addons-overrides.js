import test from 'ava';
import { L10nRegistry, FileSource, AddonSource } from '../lib/main';

test.before(() => {
  let fileSource = new FileSource('app', '/app/data/locales/{locale}/');
  fileSource.fs = {
    '/app/data/locales/pl/test.ftl': 'key = value'
  };
  L10nRegistry.registerSource(fileSource);

  let oneSource = new AddonSource('langpack-pl', ['pl'], '/data/locales/{locale}/');
  oneSource.fs = {
    '/data/locales/pl/test.ftl': 'key = addon value'
  };
  L10nRegistry.registerSource(oneSource);
});

test.after(() => {
  L10nRegistry._clearSources();
});

test('has two sources', t => {
  t.is(Object.keys(L10nRegistry.sources).length, 2);
  t.is(L10nRegistry.sources.hasOwnProperty('langpack-pl'), true);
});

test('returns correct bundles', t => {
  let res = L10nRegistry.getResources(['pl'], ['test.ftl']);
  let res0 = res.next();
  t.is(res0.value.locale, 'pl');
  t.is(res0.value.resources['test.ftl'].data, 'key = addon value');
  t.is(res0.value.resources['test.ftl'].source, 'langpack-pl');

  let res1 = res.next();
  t.is(res1.value.locale, 'pl');
  t.is(res1.value.resources['test.ftl'].data, 'key = value');
  t.is(res1.value.resources['test.ftl'].source, 'app');

  t.is(res.next().done, true);
});
