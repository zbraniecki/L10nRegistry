import test from 'ava';
import { L10nRegistry, IndexedFileSource } from '../lib/main';
import '../lib/test/io';

test.before(() => {
  let oneSource = new IndexedFileSource('langpack-pl', ['pl'], './data/locales/{locale}/');
  L10nRegistry.registerSource(oneSource);
  L10nRegistry.fs = {
    '/data/locales/pl/test.ftl': 'key = value'
  };
});

test.after(() => {
  L10nRegistry.sources.clear();
});

test('has one source', t => {
  t.is(L10nRegistry.sources.size, 1);
  t.is(L10nRegistry.sources.has('langpack-pl'), true);
});
