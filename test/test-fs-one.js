import test from 'ava';
import { L10nRegistry, FileSource } from '../lib/main';
import '../lib/test/io';

test.before(() => {
  let oneSource = new FileSource('app', ['en-US'], './app/data/locales/{locale}/');
  L10nRegistry.fs = {
    './app/data/locales/en-US/test.ftl': 'key = value'
  };
  L10nRegistry.registerSource(oneSource);
});

test.after(() => {
  L10nRegistry._clearSources();
});

test('has one source', t => {
  t.is(Object.keys(L10nRegistry.sources).length, 1);
  t.is(L10nRegistry.sources.hasOwnProperty('app'), true);
});

test('returns a single bundle', t => {
  let res = L10nRegistry.getResources(['en-US'], ['test.ftl']);
  let res0 = res.next();
  t.is(res0.value.locale, 'en-US');
  t.is(res0.value.resources['test.ftl'].data, 'key = value');
  t.is(res0.value.resources['test.ftl'].source, 'app');

  t.is(res.next().done, true);
});

test('returns no bundles for missing locale', t => {
  let res = L10nRegistry.getResources(['pl'], ['test.ftl']);

  t.is(res.next().done, true);
});

