import Bundle from './bundle';
export { FileSource } from './sources';

const sourcesOrder = [];

export const L10nRegistry = {
  sources: {},

  * getResources(requestedLangs, resIds) {
    const bundles = getBundles(requestedLangs, resIds);

    for (const bundle of bundles) {
      if (bundle.load()) {
        yield bundle;
      }
    }
  },

  registerSource(source) {
    L10nRegistry.sources[source.name] = source;
    sourcesOrder.unshift(source.name);
  },
};

function* getBundles(requestedLangs, resIds) {
  for (const loc of requestedLangs) {
    yield * getLocaleBundles(loc, sourcesOrder, resIds);
  }
}

function* getLocaleBundles(loc, array, resIds, initialStuff = []) {
  const num = initialStuff.length;
  const size = resIds.length;

  for (const elem of array) {
    const order = initialStuff.concat(elem);

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

