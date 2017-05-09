import test from 'ava';
import { L10nRegistry, FileSource } from '../lib/main';
import '../lib/test/io';

test.before(() => {
  let oneSource = new FileSource('platform', ['en-US', 'pl'], './platform/data/locales/{locale}/');
  L10nRegistry.registerSource(oneSource);

  let secondSource = new FileSource('app', ['en-US', 'pl'], './app/data/locales/{locale}/');
  L10nRegistry.registerSource(secondSource);
  L10nRegistry.fs = {
    './platform/data/locales/en-US/menu.ftl': 'key = platform value',
    './platform/data/locales/pl/menu.ftl': 'key = dane platformy',
    './app/data/locales/en-US/menu.ftl': 'key = app value',
    './app/data/locales/en-US/about.ftl': 'key2 = about app',
    './app/data/locales/pl/about.ftl': 'key2 = o aplikacji',
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

test('returns correct contexts for two sources for en-US', t => {
  let ctxs = L10nRegistry.generateContexts(['en-US'], ['menu.ftl', 'about.ftl']);
  let ctx0 = ctxs.next();

  t.is(ctx0.value.messages.has('key'), true);
  let msg0 = ctx0.value.messages.get('key');
  t.is(ctx0.value.format(msg0), 'app value');

  t.is(ctx0.value.messages.has('key2'), true);
  let msg1 = ctx0.value.messages.get('key2');
  t.is(ctx0.value.format(msg1), 'about app');

  let ctx1 = ctxs.next();

  t.is(ctx1.value.messages.has('key'), true);
  let msg2 = ctx1.value.messages.get('key');
  t.is(ctx1.value.format(msg2), 'platform value');

  t.is(ctx1.value.messages.has('key2'), true);
  let msg3 = ctx1.value.messages.get('key2');
  t.is(ctx1.value.format(msg3), 'about app');

  t.is(ctxs.next().done, true);
});

test('returns correct contexts for two sources for [pl, en-US]', t => {
  let ctxs = L10nRegistry.generateContexts(['pl', 'en-US'], ['menu.ftl', 'about.ftl']);
  let ctx, msg;
  ctx = ctxs.next();

  t.is(ctx.value.locales[0], 'pl');
  t.is(ctx.value.messages.has('key'), true);
  msg = ctx.value.messages.get('key');
  t.is(ctx.value.format(msg), 'dane platformy');

  t.is(ctx.value.messages.has('key2'), true);
  msg = ctx.value.messages.get('key2');
  t.is(ctx.value.format(msg), 'o aplikacji');

  ctx = ctxs.next();

  t.is(ctx.value.locales[0], 'en-US');
  t.is(ctx.value.messages.has('key'), true);
  msg = ctx.value.messages.get('key');
  t.is(ctx.value.format(msg), 'app value');

  t.is(ctx.value.messages.has('key2'), true);
  msg = ctx.value.messages.get('key2');
  t.is(ctx.value.format(msg), 'about app');

  ctx = ctxs.next();

  t.is(ctx.value.locales[0], 'en-US');
  t.is(ctx.value.messages.has('key'), true);
  msg = ctx.value.messages.get('key');
  t.is(ctx.value.format(msg), 'platform value');

  t.is(ctx.value.messages.has('key2'), true);
  msg = ctx.value.messages.get('key2');
  t.is(ctx.value.format(msg), 'about app');

  t.is(ctxs.next().done, true);
});
