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
  let ctxs = L10nRegistry.generateContexts(['en-US'], ['test.ftl']);
  let ctx0 = ctxs.next();

  t.is(ctx0.value.messages.has('key'), true);
  let msg = ctx0.value.messages.get('key');
  t.is(ctx0.value.format(msg), 'platform value');

  t.is(ctxs.next().done, true);
});

test('returns correct bundles for [pl, en-US]', t => {
  let ctxs = L10nRegistry.generateContexts(['pl', 'en-US'], ['test.ftl']);
  let ctx0 = ctxs.next();
  t.is(ctx0.value.locales[0], 'pl');
  t.is(ctx0.value.messages.has('key'), true);
  let msg0 = ctx0.value.messages.get('key');
  t.is(ctx0.value.format(msg0), 'app value');

  let ctx1 = ctxs.next();
  t.is(ctx1.value.locales[0], 'en-US');
  t.is(ctx1.value.messages.has('key'), true);
  let msg1 = ctx1.value.messages.get('key');
  t.is(ctx1.value.format(msg1), 'platform value');

  t.is(ctxs.next().done, true);
});
