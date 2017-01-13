import assert from 'assert';
import { L10nRegistry, FileSource } from '../lib/main';

describe('One source, one locale', function() {
  before(function() {
    let oneSource = new FileSource('app', './app/data/locales/{locale}/');
    oneSource.fs = {
      './app/data/locales/en-US/test.ftl': 'key = value'
    };
    L10nRegistry.registerSource(oneSource);
  });

  after(function() {
    L10nRegistry._clearSources();
  });

  it('has one source', function() {
    assert.equal(Object.keys(L10nRegistry.sources).length, 1);
    assert.equal(L10nRegistry.sources.hasOwnProperty('app'), true);
  });

  it('returns a single bundle', function() {
    let res = L10nRegistry.getResources(['en-US'], ['test.ftl']);
    let res0 = res.next();
    assert.equal(res0.value.locale, 'en-US');
    assert.equal(res0.value.resources['test.ftl'].data, 'key = value');
    assert.equal(res0.value.resources['test.ftl'].source, 'app');

    assert.equal(res.next().done, true);
  });
});

describe('Two sources, two locales', function() {
  before(function() {
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

  it('has two sources', function() {
    assert.equal(Object.keys(L10nRegistry.sources).length, 2);
    assert.equal(L10nRegistry.sources.hasOwnProperty('app'), true);
    assert.equal(L10nRegistry.sources.hasOwnProperty('platform'), true);
  });

  it('returns correct bundles for en-US', function() {
    let res = L10nRegistry.getResources(['en-US'], ['test.ftl']);
    let res0 = res.next();
    assert.equal(res0.value.locale, 'en-US');
    assert.equal(res0.value.resources['test.ftl'].data, 'key = platform value');
    assert.equal(res0.value.resources['test.ftl'].source, 'platform');

    assert.equal(res.next().done, true);
  });

  it('returns correct bundles for [pl, en-US]', function() {
    let res = L10nRegistry.getResources(['pl', 'en-US'], ['test.ftl']);
    let res0 = res.next();
    assert.equal(res0.value.locale, 'pl');
    assert.equal(res0.value.resources['test.ftl'].data, 'key = app value');
    assert.equal(res0.value.resources['test.ftl'].source, 'app');

    let res1 = res.next();
    assert.equal(res1.value.locale, 'en-US');
    assert.equal(res1.value.resources['test.ftl'].data, 'key = platform value');
    assert.equal(res1.value.resources['test.ftl'].source, 'platform');

    assert.equal(res.next().done, true);
  });
});
