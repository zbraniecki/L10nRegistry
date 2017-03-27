import { L10nRegistry } from '../registry';

L10nRegistry.load = async function(url) {
  return Promise.resolve(L10nRegistry.fs[url]);
};
