import test from 'ava';
import { L10nRegistry, AddonSource } from '../lib/main';
import '../lib/test/io';

test.before(() => {
  let oneSource = new AddonSource('langpack-pl', ['pl'], './data/locales/{locale}/');
  L10nRegistry.registerSource(oneSource);
  L10nRegistry.fs = {
    '/data/locales/pl/test.ftl': 'key = value'
  };
});

test.after(() => {
  L10nRegistry._clearSources();
});

test('has one source', t => {
  t.is(Object.keys(L10nRegistry.sources).length, 1);
  t.is(L10nRegistry.sources.hasOwnProperty('langpack-pl'), true);
});
