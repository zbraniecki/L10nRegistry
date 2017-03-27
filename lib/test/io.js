import { L10nRegistry } from '../registry';

L10nRegistry.load = function(url) {
  return L10nRegistry.fs[url];
};
