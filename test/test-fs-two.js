import test from 'ava';
import { L10nRegistry, FileSource } from '../lib/main';

test.before(() => {
  let oneSource = new FileSource('platform', './platform/data/locales/{locale}/');
  oneSource.fs = {
    './platform/data/locales/en-US/test.ftl': 'key = platform value'
  };
  L10nRegistry.registerSource(oneSource);

  let secondSource = new FileSource('app', './app/data/locales/{locale}/');
  secondSource.fs = {
    './app/data/locales/pl/test.ftl': 'key = app value'
  };
  L10nRegistry.registerSource(secondSource);
});

test.after(() => {
  L10nRegistry._clearSources();
});

test('has two sources', t => {
  t.is(Object.keys(L10nRegistry.sources).length, 2);
  t.is(L10nRegistry.sources.hasOwnProperty('app'), true);
  t.is(L10nRegistry.sources.hasOwnProperty('platform'), true);
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
