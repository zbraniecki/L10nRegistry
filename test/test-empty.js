import test from 'ava';
import { L10nRegistry, FileSource } from '../lib/main';

test('should have L10nRegistry in the scope', t => {
  t.is(typeof L10nRegistry, 'object');
});

test('should have FileSource in the scope', t => {
  t.is(typeof FileSource, 'function');
});
