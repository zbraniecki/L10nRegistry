import test from 'ava';
import { L10nRegistry, FileSource } from '../lib/main';
import '../lib/test/io';

test.before(() => {
  let oneSource = new FileSource('platform', ['en-US'], './platform/data/locales/{locale}/');
  L10nRegistry.registerSource(oneSource);

  let secondSource = new FileSource('app', ['pl'], './app/data/locales/{locale}/');
  L10nRegistry.registerSource(secondSource);
  L10nRegistry.fs = {
    './platform/data/locales/en-US/test.ftl': 'key = platform value',
    './app/data/locales/pl/test.ftl': 'key = app value'
  };
});

test.after(() => {
  L10nRegistry._clearSources();
});

test('has two sources', t => {
  t.is(L10nRegistry.sources.size, 2);
  t.is(L10nRegistry.sources.has('app'), true);
  t.is(L10nRegistry.sources.has('platform'), true);
});

test('returns correct bundles for en-US', t => {
  let res = L10nRegistry.getResources(['en-US'], ['test.ftl']);
  let res0 = res.next();
  t.is(res0.value.locale, 'en-US');
  t.is(res0.value.resources['test.ftl'].data, 'key = platform value');
  t.is(res0.value.resources['test.ftl'].source, 'platform');

  t.is(res.next().done, true);
});

test('returns correct bundles for [pl, en-US]', t => {
  let res = L10nRegistry.getResources(['pl', 'en-US'], ['test.ftl']);
  let res0 = res.next();
  t.is(res0.value.locale, 'pl');
  t.is(res0.value.resources['test.ftl'].data, 'key = app value');
  t.is(res0.value.resources['test.ftl'].source, 'app');

  let res1 = res.next();
  t.is(res1.value.locale, 'en-US');
  t.is(res1.value.resources['test.ftl'].data, 'key = platform value');
  t.is(res1.value.resources['test.ftl'].source, 'platform');

  t.is(res.next().done, true);
});
