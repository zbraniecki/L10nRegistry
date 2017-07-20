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
  L10nRegistry.sources.clear();
});

test('has two sources', t => {
  t.is(L10nRegistry.sources.size, 2);
  t.is(L10nRegistry.sources.has('app'), true);
  t.is(L10nRegistry.sources.has('platform'), true);
});

test.skip('returns correct contexts for two sources for en-US', async t => {
  let ctxs = L10nRegistry.generateContexts(['en-US'], ['menu.ftl', 'about.ftl']);
  let ctx0 = await ctxs.next().value;

  t.is(ctx0.hasMessage('key'), true);
  let msg0 = ctx0.getMessage('key');
  t.is(ctx0.format(msg0), 'app value');

  t.is(ctx0.hasMessage('key2'), true);
  let msg1 = ctx0.getMessage('key2');
  t.is(ctx0.format(msg1), 'about app');

  let ctx1 = await ctxs.next().value;

  t.is(ctx1.hasMessage('key'), true);
  let msg2 = ctx1.getMessage('key');
  t.is(ctx1.format(msg2), 'platform value');

  t.is(ctx1.hasMessage('key2'), true);
  let msg3 = ctx1.getMessage('key2');
  t.is(ctx1.format(msg3), 'about app');

  t.is(ctxs.next().done, true);
});

test.skip('returns correct contexts for two sources for [pl, en-US]', async t => {
  let ctxs = L10nRegistry.generateContexts(['pl', 'en-US'], ['menu.ftl', 'about.ftl']);
  let ctx, msg;
  ctx = await ctxs.next().value;

  t.is(ctx.locales[0], 'pl');
  t.is(ctx.hasMessage('key'), true);
  msg = ctx.getMessage('key');
  t.is(ctx.format(msg), 'dane platformy');

  t.is(ctx.hasMessage('key2'), true);
  msg = ctx.getMessage('key2');
  t.is(ctx.format(msg), 'o aplikacji');

  ctx = await ctxs.next().value;

  t.is(ctx.locales[0], 'en-US');
  t.is(ctx.hasMessage('key'), true);
  msg = ctx.getMessage('key');
  t.is(ctx.format(msg), 'app value');

  t.is(ctx.hasMessage('key2'), true);
  msg = ctx.getMessage('key2');
  t.is(ctx.format(msg), 'about app');

  ctx = await ctxs.next().value;

  t.is(ctx.locales[0], 'en-US');
  t.is(ctx.hasMessage('key'), true);
  msg = ctx.getMessage('key');
  t.is(ctx.format(msg), 'platform value');

  t.is(ctx.hasMessage('key2'), true);
  msg = ctx.getMessage('key2');
  t.is(ctx.format(msg), 'about app');

  t.is(ctxs.next().done, true);
});
