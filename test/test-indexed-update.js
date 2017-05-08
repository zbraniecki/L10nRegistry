import test from 'ava';
import { L10nRegistry, FileSource, IndexedFileSource } from '../lib/main';
import '../lib/test/io';

test.before(() => {
  let fileSource = new FileSource('app', ['pl'], '/app/data/locales/{locale}/');
  L10nRegistry.registerSource(fileSource);

  let oneSource = new IndexedFileSource('langpack-pl', ['pl'], '/data/locales/{locale}/', [
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

test('returns new contexts', t => {
  const newSource = new IndexedFileSource('langpack-pl', ['pl'], '/data/locales/{locale}/', [
    '/data/locales/pl/test.ftl'
  ]);
  L10nRegistry.fs['/data/locales/pl/test.ftl'] = 'key = new value';
  L10nRegistry.updateSource(newSource);

  let ctxs = L10nRegistry.generateContexts(['pl'], ['test.ftl']);
  let ctx0 = ctxs.next();
  t.is(ctx0.value.locales[0], 'pl');
  t.is(ctx0.value.messages.has('key'), true);
  let msg0 = ctx0.value.messages.get('key');
  t.is(ctx0.value.format(msg0), 'new value');

  let ctx1 = ctxs.next();
  t.is(ctx1.value.locales[0], 'pl');
  t.is(ctx1.value.messages.has('key'), true);
  let msg1 = ctx1.value.messages.get('key');
  t.is(ctx1.value.format(msg1), 'value');

  t.is(ctxs.next().done, true);
});
