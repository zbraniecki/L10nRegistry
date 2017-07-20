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
  L10nRegistry.sources.clear();
});

test('has two sources', t => {
  t.is(L10nRegistry.sources.size, 2);
  t.is(L10nRegistry.sources.has('langpack-pl'), true);
});

test('returns correct bundles', async t => {
  let ctxs = L10nRegistry.generateContexts(['pl'], ['test.ftl']);
  let ctx0 = await ctxs.next().value;
  t.is(ctx0.locales[0], 'pl');
  t.is(ctx0.hasMessage('key'), true);
  let msg0 = ctx0.getMessage('key');
  t.is(ctx0.format(msg0), 'addon value');

  let ctx1 = await ctxs.next().value;
  t.is(ctx1.locales[0], 'pl');
  t.is(ctx1.hasMessage('key'), true);
  let msg1 = ctx1.getMessage('key');
  t.is(ctx1.format(msg1), 'value');

  t.is(ctxs.next().done, true);
});
