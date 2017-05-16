const { MessageContext } = require('fluent');

/**
 * L10nRegistry is a localization resource management system for Gecko.
 *
 * It manages the list of resource sources provided with the app and allows
 * for additional sources to be added and updated.
 *
 * It's primary purpose is to allow for building an iterator over MessageContext objects
 * that will be utilized by a localization API.
 *
 * The generator creates all possible permutations of locales and sources to allow for
 * complete fallbacking.
 *
 * Example:
 *
 *   FileSource1:
 *     name: 'app'
 *     locales: ['en-US', 'de']
 *     resources: [
 *       '/browser/menu.ftl',
 *       '/platform/toolkit.ftl',
 *     ]
 *   FileSource2:
 *     name: 'platform'
 *     locales: ['en-US', 'de']
 *     resources: [
 *       '/platform/toolkit.ftl',
 *     ]
 *
 * If the user will request:
 *   L10nRegistry.generateContexts(['de', 'en-US'], [
 *     '/browser/menu.ftl',
 *     '/platform/toolkit.ftl'
 *   ]);
 *
 * the generator will return an iterator over the following contexts:
 *
 *   {
 *     locale: 'pl',
 *     resources: [
 *       ['app', '/browser/menu.ftl'],
 *       ['platform', '/platform/toolkit.ftl'],
 *     ]
 *   },
 *   {
 *     locale: 'pl',
 *     resources: [
 *       ['platform', '/browser/menu.ftl'],
 *       ['platform', '/platform/toolkit.ftl'],
 *     ]
 *   },
 *   {
 *     locale: 'en-US',
 *     resources: [
 *       ['app', '/browser/menu.ftl'],
 *       ['platform', '/platform/toolkit.ftl'],
 *     ]
 *   },
 *   {
 *     locale: 'en-US',
 *     resources: [
 *       ['platform', '/browser/menu.ftl'],
 *       ['platform', '/platform/toolkit.ftl'],
 *     ]
 *   }
 *
 * This allows the localization API to consume the MessageContext and lazily fallback
 * on the next in case of a missing string or error.
 *
 * If during the life-cycle of the app a new source is added, the generator can be called again
 * and will produce a new set of permutations placing the language pack provided resources
 * at the top.
 */

export const L10nRegistry = {
  sources: new Map(),
  sourcesOrder: [],

  * generateContexts(requestedLangs, resIds) {
    for (const loc of requestedLangs) {
      yield * generateContextsForLocale(loc, L10nRegistry.sourcesOrder, resIds);
    }
  },

  registerSource(source) {
    if (L10nRegistry.sources.has(source.name)) {
      throw new Error(`Source with name "${source.name}" already registered.`);
    }
    L10nRegistry.sources.set(source.name, source);
    L10nRegistry.sourcesOrder.unshift(source.name);
  },

  updateSource(source) {
    if (!L10nRegistry.sources.has(source.name)) {
      throw new Error(`Source with name "${source.name}" is not registered.`);
    }
    L10nRegistry.sources.set(source.name, source);
  },

  getAvailableLocales() {
    const locales = new Set();

    for (const name of L10nRegistry.sourcesOrder) {
      const source = L10nRegistry.sources.get(name);
      for (const loc of source.locales) {
        locales.add(loc);
      }
    }
    return Array.from(locales);
  },

  _clearSources() {
    L10nRegistry.sources.clear();
    L10nRegistry.sourcesOrder.length = 0;
  },
};

// This helper function generates contexts for a given locale.
function* generateContextsForLocale(loc, sourcesOrder, resIds, resolvedOrder = []) {
  const resolvedLength = resolvedOrder.length;
  const resourcesLength = resIds.length;

  // Inside that loop we have a list of resources and the sources for them, like this:
  //   ['test.ftl', 'menu.ftl', 'foo.ftl']
  //   ['app', 'platform', 'app']
  for (const sourceId of sourcesOrder) {
    const order = resolvedOrder.concat(sourceId);

    if (order.some((id, idx) => L10nRegistry.sources.get(id).hasFile(loc, resIds[idx]) === false)) {
      continue;
    }

    // If the number of resolved sources equals the number of resources,
    // create the right context and return it if it loads.
    if (resolvedLength + 1 === resourcesLength) {
      const ctx = generateContext(loc, order, resIds);
      if (ctx) {
        yield ctx;
      }
    } else {
      // otherwise recursively load another generator that walks over the partially resolved
      // list of sources.
      yield * generateContextsForLocale(loc, sourcesOrder, resIds, order);
    }
  }
}

function generateContext(loc, sourcesOrder, resIds) {
  const ctx = new MessageContext(loc);
  for (let i = 0; i < resIds.length; i++) {
    const data = L10nRegistry.sources.get(sourcesOrder[i]).fetchFile(loc, resIds[i]);
    if (data === null) {
      return false;
    }
    ctx.addMessages(data);
  }
  return ctx;
}
