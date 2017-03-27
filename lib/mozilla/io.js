/*global Components */
import { L10nRegistry } from '../registry';

//XXX: This will eventually be async
L10nRegistry.load = function(url) {
  const req = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1']
    .createInstance(Components.interfaces.nsIXMLHttpRequest);

  req.mozBackgroundRequest = true;
  req.overrideMimeType('text/plain');

  req.open('GET', url, false);
  try {
    req.send(null);
  } catch (e) {
    return undefined;
  }

  return req.responseText;
};
