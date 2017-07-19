import { L10nRegistry } from '../registry';

/**
 * We keep it as a method to make it easier
 * to override for testing purposes.
 **/
L10nRegistry.load = function(url) {
  return fetch(url).then(data => data.text()).catch(() => undefined); 
};
