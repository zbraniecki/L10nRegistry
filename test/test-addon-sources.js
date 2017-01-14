import assert from 'assert';
import { L10nRegistry, FileSource, AddonSource } from '../lib/main';

describe('One Addon source', function() {
  before(function() {
    let oneSource = new AddonSource('langpack-pl', ['pl'], './data/locales/{locale}/');
    oneSource.fs = {
      '/data/locales/pl/test.ftl': 'key = value'
    };
    L10nRegistry.registerSource(oneSource);
  });

  after(function() {
    L10nRegistry._clearSources();
  });

  it('has one source', function() {
    assert.equal(Object.keys(L10nRegistry.sources).length, 1);
    assert.equal(L10nRegistry.sources.hasOwnProperty('langpack-pl'), true);
  });
});

describe('Overrides file sources', function() {
  before(function() {
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

  after(function() {
    L10nRegistry._clearSources();
  });

  it('has two sources', function() {
    assert.equal(Object.keys(L10nRegistry.sources).length, 2);
    assert.equal(L10nRegistry.sources.hasOwnProperty('langpack-pl'), true);
  });

  it('returns correct bundles', function() {
    let res = L10nRegistry.getResources(['pl'], ['test.ftl']);
    let res0 = res.next();
    assert.equal(res0.value.locale, 'pl');
    assert.equal(res0.value.resources['test.ftl'].data, 'key = addon value');
    assert.equal(res0.value.resources['test.ftl'].source, 'langpack-pl');

    let res1 = res.next();
    assert.equal(res1.value.locale, 'pl');
    assert.equal(res1.value.resources['test.ftl'].data, 'key = value');
    assert.equal(res1.value.resources['test.ftl'].source, 'app');

    assert.equal(res.next().done, true);
  });

});

describe('Updating source works', function() {
  before(function() {
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

  after(function() {
    L10nRegistry._clearSources();
  });

  it('has two sources', function() {
    assert.equal(Object.keys(L10nRegistry.sources).length, 2);
    assert.equal(L10nRegistry.sources.hasOwnProperty('langpack-pl'), true);
  });

  it('returns new bundles', function() {
    const newSource = new AddonSource('langpack-pl', ['pl'], '/data/locales/{locale}/');
    newSource.fs = {
      '/data/locales/pl/test.ftl': 'key = new value'
    };
    L10nRegistry.updateSource(newSource);

    let res = L10nRegistry.getResources(['pl'], ['test.ftl']);
    let res0 = res.next();
    assert.equal(res0.value.locale, 'pl');
    assert.equal(res0.value.resources['test.ftl'].data, 'key = new value');
    assert.equal(res0.value.resources['test.ftl'].source, 'langpack-pl');

    let res1 = res.next();
    assert.equal(res1.value.locale, 'pl');
    assert.equal(res1.value.resources['test.ftl'].data, 'key = value');
    assert.equal(res1.value.resources['test.ftl'].source, 'app');

    assert.equal(res.next().done, true);
  });

});
