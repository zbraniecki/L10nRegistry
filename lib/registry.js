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
 *     locale: 'de',
 *     resources: [
 *       ['app', '/browser/menu.ftl'],
 *       ['app', '/platform/toolkit.ftl'],
 *     ]
 *   },
 *   {
 *     locale: 'de',
 *     resources: [
 *       ['app', '/browser/menu.ftl'],
 *       ['platform', '/platform/toolkit.ftl'],
 *     ]
 *   },
 *   {
 *     locale: 'en-US',
 *     resources: [
 *       ['app', '/browser/menu.ftl'],
 *       ['app', '/platform/toolkit.ftl'],
 *     ]
 *   },
 *   {
 *     locale: 'en-US',
 *     resources: [
 *       ['app', '/browser/menu.ftl'],
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
  ctxCache: new Map(),

  /**
   * Based on the list of requested languages and resource Ids,
   * this function returns an lazy iterator over message context permutations.
   *
   * @param {Array} requestedLangs
   * @param {Array} resourceIds
   * @returns {Iterator<MessageContext>}
   */
  * generateContexts(requestedLangs, resourceIds) {
    const sourcesOrder = Array.from(this.sources.keys()).reverse();
    for (const locale of requestedLangs) {
      yield * generateContextsForLocale(locale, sourcesOrder, resourceIds);
    }
  },

  /**
   * Adds a new resource source to the L10nRegistry.
   *
   * @param {FileSource} source
   */
  registerSource(source) {
    if (this.sources.has(source.name)) {
      throw new Error(`Source with name "${source.name}" already registered.`);
    }
    this.sources.set(source.name, source);
  },

  /**
   * Updates an existing source in the L10nRegistry
   *
   * That will usually happen when a new version of a source becomes
   * available (for example, an updated version of a language pack).
   *
   * @param {FileSource} source
   */
  updateSource(source) {
    if (!this.sources.has(source.name)) {
      throw new Error(`Source with name "${source.name}" is not registered.`);
    }
    this.sources.set(source.name, source);
    this.ctxCache.clear();
  },

  /**
   * Removes a source from the L10nRegistry.
   *
   * @param {String} sourceId
   */
  removeSource(sourceName) {
    this.sources.delete(sourceName);
  },

  /**
   * Returns a list of locales for which at least one source
   * has resources.
   *
   * @returns {Array<String>}
   */
  getAvailableLocales() {
    const locales = new Set();

    for (const source of this.sources.values()) {
      for (const locale of source.locales) {
        locales.add(locale);
      }
    }
    return Array.from(locales);
  },
};

/**
 * A helper function for generating unique context ID used for caching
 * MessageContexts.
 *
 * @param {String} locale
 * @param {Array} sourcesOrder
 * @param {Array} resourceIds
 * @returns {String}
 */
function generateContextID(locale, sourcesOrder, resourceIds) {
  const sources = sourcesOrder.join(',');
  const ids = resourceIds.join(',');
  return `${locale}|${sources}|${ids}`;
}

/**
 * This function generates an iterator over MessageContexts for a single locale
 * for a given list of resourceIds for all possible combinations of sources.
 *
 * This function is called recursively to generate all possible permutations
 * and uses the last, optional parameter, to pass the already resolved
 * sources order.
 *
 * @param {String} locale
 * @param {Array} sourcesOrder
 * @param {Array} resourceIds
 * @param {Array} [resolvedOrder]
 * @returns {Iterator<MessageContext>}
 */
function* generateContextsForLocale(locale, sourcesOrder, resourceIds, resolvedOrder = []) {
  const resolvedLength = resolvedOrder.length;
  const resourcesLength = resourceIds.length;

  // Inside that loop we have a list of resources and the sources for them, like this:
  //   ['test.ftl', 'menu.ftl', 'foo.ftl']
  //   ['app', 'platform', 'app']
  for (const sourceName of sourcesOrder) {
    const order = resolvedOrder.concat(sourceName);

    // We bail only if the hasFile returns a strict false here,
    // because for FileSource it may also return undefined, which means
    // that we simply don't know if the source contains the file and we'll
    // have to perform the I/O to learn.
    if (L10nRegistry.sources.get(sourceName).hasFile(locale, resourceIds[resolvedOrder.length]) === false) {
      continue;
    }

    // If the number of resolved sources equals the number of resources,
    // create the right context and return it if it loads.
    if (resolvedLength + 1 === resourcesLength) {
      yield generateContext(locale, order, resourceIds);
    } else {
      // otherwise recursively load another generator that walks over the
      // partially resolved list of sources.
      yield * generateContextsForLocale(locale, sourcesOrder, resourceIds, order);
    }
  }
}

/**
 * Generates a single MessageContext by loading all resources
 * from the listed sources for a given locale.
 *
 * @param {String} locale
 * @param {Array} sourcesOrder
 * @param {Array} resourceIds
 * @returns {Promise<MessageContext>}
 */
async function generateContext(locale, sourcesOrder, resourceIds) {
  const ctxId = generateContextID(locale, sourcesOrder, resourceIds);
  if (!L10nRegistry.ctxCache.has(ctxId)) {
    const ctx = new MessageContext(locale);
    for (let i = 0; i < resourceIds.length; i++) {
      const data = await L10nRegistry.sources.get(sourcesOrder[i]).fetchFile(locale, resourceIds[i]);
      if (data === null) {
        return false;
      }
      ctx.addMessages(data);
    }
    L10nRegistry.ctxCache.set(ctxId, ctx);
  }
  return L10nRegistry.ctxCache.get(ctxId);
}
