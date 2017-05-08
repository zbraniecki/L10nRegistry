export { FileSource, IndexedFileSource } from './sources';
const { MessageContext } = require('fluent');

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

function* generateContextsForLocale(loc, sourcesOrder, resIds, resolvedOrder = []) {
  const num = resolvedOrder.length;
  const size = resIds.length;

  for (const sourceId of sourcesOrder) {
    const order = resolvedOrder.concat(sourceId);

    if (order.some((id, idx) => L10nRegistry.sources.get(id).hasFile(loc, resIds[idx]) === false)) {
      continue;
    }

    if (num + 1 === size) {
      yield generateContext(loc, order, resIds);
    } else {
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
