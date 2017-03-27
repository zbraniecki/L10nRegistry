import Bundle from './bundle';

const sourcesOrder = [];

export const L10nRegistry = {
  sources: {},

  //XXX: This will eventually be an async generator
  async* getResources(requestedLangs, resIds) {
    const bundles = getBundles(requestedLangs, resIds);

    for (const bundle of bundles) {
      if (await bundle.load()) {
        yield bundle;
      }
    }
  },

  registerSource(source) {
    if (L10nRegistry.sources.hasOwnProperty(source.name)) {
      throw new Error(`Source with name "${source.name}" already registered.`);
    }
    L10nRegistry.sources[source.name] = source;
    sourcesOrder.unshift(source.name);
  },

  updateSource(source) {
    if (!L10nRegistry.sources.hasOwnProperty(source.name)) {
      throw new Error(`Source with name "${source.name}" is not registered.`);
    }
    L10nRegistry.sources[source.name] = source;
  },

  getAvailableLocales() {
    const locales = new Set();

    for (const name of sourcesOrder) {
      const source = L10nRegistry.sources[name];
      for (const loc of source.locales) {
        locales.add(loc);
      }
    }
    return Array.from(locales);
  },

  _clearSources() {
    L10nRegistry.sources = {};
    sourcesOrder.length = 0;
  },
};

function* getBundles(requestedLangs, resIds) {
  for (const loc of requestedLangs) {
    yield * getLocaleBundles(loc, sourcesOrder, resIds);
  }
}

function* getLocaleBundles(loc, array, resIds, resolvedOrder = []) {
  const num = resolvedOrder.length;
  const size = resIds.length;

  for (const elem of array) {
    const order = resolvedOrder.concat(elem);

    if (order.some((x, i) => L10nRegistry.sources[x].hasFile(loc, resIds[i]) === false)) {
      continue;
    }

    if (num + 1 === size) {
      const resources = {};
      for (const j in resIds) {
        resources[resIds[j]] = {
          locale: loc,
          source: order[j],
          data: null
        };
      }
      yield new Bundle(loc, resources);
    } else {
      yield * getLocaleBundles(loc, array, resIds, order);
    }
  }
}

