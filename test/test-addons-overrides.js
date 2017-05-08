import test from 'ava';
import { L10nRegistry, FileSource, AddonSource } from '../lib/main';
import '../lib/test/io';

test.before(() => {
  let fileSource = new FileSource('app', ['pl'], '/app/data/locales/{locale}/');
  L10nRegistry.registerSource(fileSource);

  let oneSource = new AddonSource('langpack-pl', ['pl'], '/data/locales/{locale}/', [
    '/data/locales/pl/test.ftl'
  ]);
  L10nRegistry.registerSource(oneSource);

  L10nRegistry.fs = {
    '/app/data/locales/pl/test.ftl': 'key = value',
    '/data/locales/pl/test.ftl': 'key = addon value'
  };
});

test.after(() => {
  L10nRegistry._clearSources();
});

test('has two sources', t => {
  t.is(L10nRegistry.sources.size, 2);
  t.is(L10nRegistry.sources.has('langpack-pl'), true);
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
