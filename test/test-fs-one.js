import test from 'ava';
import { L10nRegistry, FileSource } from '../lib/main';
import '../lib/test/io';

test.before(() => {
  let oneSource = new FileSource('app', ['en-US'], './app/data/locales/{locale}/');
  L10nRegistry.fs = {
    './app/data/locales/en-US/test.ftl': 'key = value en-US'
  };
  L10nRegistry.registerSource(oneSource);
});

test.after(() => {
  L10nRegistry.sources.clear();
});

test('has one source', t => {
  t.is(L10nRegistry.sources.size, 1);
  t.is(L10nRegistry.sources.has('app'), true);
});

test('returns a single context', async t => {
  let ctxs = L10nRegistry.generateContexts(['en-US'], ['test.ftl']);
  let ctx0 = await ctxs.next().value;
  t.is(ctx0.hasMessage('key'), true);

  t.is(ctxs.next().done, true);
});

test('returns no contexts for missing locale', t => {
  let ctxs = L10nRegistry.generateContexts(['pl'], ['test.ftl']);

  t.is(ctxs.next().done, true);
});

