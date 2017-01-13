import { Bundle } from './bundle';

const sourcesOrder = [];

export const L10nRegistry = {
  sources: {},

  * getResources(requestedLangs, resIds) {
    let bundles = getBundles(requestedLangs, resIds);

    for (let bundle of bundles) {
      if (bundle.load()) {
        yield bundle;
      }
    }
  },

  registerSource(source) {
    L10nRegistry.sources[source.name] = source;
    sourcesOrder.unshift(source.name);
  },

  onResourceChanges(sourceName, resList) {

  },

  fetchResource(source, resId, lang) {

  },
};

function* getBundles(requestedLangs, resIds) {
  for (let loc of requestedLangs) {
    yield * getLocaleBundles(loc, sourcesOrder, resIds);
  }
}

function* getLocaleBundles(loc, array, resIds, initialStuff = []) {
  let num = initialStuff.length;
  let size = resIds.length;

  for (let elem of array) {
    let resId = resIds[num];
    let order = initialStuff.concat(elem);

    if (order.some((x, i) => L10nRegistry.sources[x].hasFile(loc, resIds[i]) === false)) {
      continue;
    }

    if (num + 1 === size) {
      let resources = {};
      for (let j in resIds) {
        resources[resIds[j]] = {
          locale: loc,
          source: order[j],
          data: null
        }
      }
      yield new Bundle(loc, resources);
    } else {
      yield * getLocaleBundles(loc, array, resIds, order);
    }
  }
}

