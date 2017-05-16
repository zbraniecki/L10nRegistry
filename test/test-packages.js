import test from 'ava';
import { L10nRegistry, FileSource } from '../lib/main';
import '../lib/test/io';

test.before(() => {
  let oneSource = new FileSource('platform', ['en-US'], './platform/data/locales/{locale}', ['firefox', 'devtools']);
  L10nRegistry.registerSource(oneSource);

  let secondSource = new FileSource('app', ['pl'], './app/data/locales/{locale}', ['firefox']);
  L10nRegistry.registerSource(secondSource);
  L10nRegistry.fs = {
    './platform/data/locales/en-US/firefox.ftl': 'app = Firefox [en-US]',
    './platform/data/locales/en-US/devtools.ftl': 'devtools = Dev Tools [en-US]',
    './app/data/locales/pl/firefox.ftl': 'app = Firefox [pl]'
  };
});

test.after(() => {
  L10nRegistry._clearSources();
});

test('returns correct bundles for Firefox', t => {
  let ctxs = L10nRegistry.generateContexts(['pl', 'en-US'], ['/firefox.ftl'], 'firefox');
  let ctx0 = ctxs.next();

  t.is(ctx0.value.messages.has('app'), true);
  let msg = ctx0.value.messages.get('app');
  t.is(ctx0.value.format(msg), 'Firefox [pl]');

  let ctx1 = ctxs.next();

  t.is(ctx1.value.messages.has('app'), true);
  let msg1 = ctx1.value.messages.get('app');
  t.is(ctx1.value.format(msg1), 'Firefox [en-US]');

  t.is(ctxs.next().done, true);
});

test('returns correct bundles for Devtools', t => {
  let ctxs = L10nRegistry.generateContexts(['pl', 'en-US'], ['/devtools.ftl'], 'devtools');
  let ctx0 = ctxs.next();

  t.is(ctx0.value.messages.has('devtools'), true);
  let msg = ctx0.value.messages.get('devtools');
  t.is(ctx0.value.format(msg), 'Dev Tools [en-US]');

  t.is(ctxs.next().done, true);
});
