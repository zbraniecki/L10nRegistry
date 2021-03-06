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
  L10nRegistry.sources.clear();
});

test('has two sources', t => {
  t.is(L10nRegistry.sources.size, 2);
  t.is(L10nRegistry.sources.has('app'), true);
  t.is(L10nRegistry.sources.has('platform'), true);
});

test('returns correct bundles for en-US', async t => {
  let ctxs = L10nRegistry.generateContexts(['en-US'], ['test.ftl']);
  let ctx0 = await ctxs.next().value;

  t.is(ctx0.hasMessage('key'), true);
  let msg = ctx0.getMessage('key');
  t.is(ctx0.format(msg), 'platform value');

  t.is(ctxs.next().done, true);
});

test('returns correct bundles for [pl, en-US]', async t => {
  let ctxs = L10nRegistry.generateContexts(['pl', 'en-US'], ['test.ftl']);
  let ctx0 = await ctxs.next().value;
  t.is(ctx0.locales[0], 'pl');
  t.is(ctx0.hasMessage('key'), true);
  let msg0 = ctx0.getMessage('key');
  t.is(ctx0.format(msg0), 'app value');

  let ctx1 = await ctxs.next().value;
  t.is(ctx1.locales[0], 'en-US');
  t.is(ctx1.hasMessage('key'), true);
  let msg1 = ctx1.getMessage('key');
  t.is(ctx1.format(msg1), 'platform value');

  t.is(ctxs.next().done, true);
});
