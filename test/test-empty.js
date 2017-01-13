import assert from 'assert';
import { L10nRegistry, FileSource } from '../lib/main';

describe('Empty', function() {
  it('should have an L10nRegistry in the scope', function() {
    assert.equal(typeof L10nRegistry, 'object');
  });
  
  it('should have a FileSource in the scope', function() {
    assert.equal(typeof FileSource, 'function');
  });
});
