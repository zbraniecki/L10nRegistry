import test from 'ava';
import { L10nRegistry, AddonSource } from '../lib/main';

test.before(() => {
  let oneSource = new AddonSource('langpack-pl', ['pl'], './data/locales/{locale}/');
  oneSource.fs = {
    '/data/locales/pl/test.ftl': 'key = value'
  };
  L10nRegistry.registerSource(oneSource);
});

test.after(() => {
  L10nRegistry._clearSources();
});

test('has one source', t => {
  t.is(Object.keys(L10nRegistry.sources).length, 1);
  t.is(L10nRegistry.sources.hasOwnProperty('langpack-pl'), true);
});
