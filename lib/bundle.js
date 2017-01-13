import { L10nRegistry } from './main';

export class Bundle {
  constructor(locale, resources) {
    this.locale = locale;
    this.resources = resources;
  }

  load() {
    for (const resId in this.resources) {
      const res = this.resources[resId];
      const source = L10nRegistry.sources[res.source];

      const data = source.fetchFile(this.locale, resId);

      if (data !== null) {
        res.data = data;
      } else {
        //XXX: We may want to not break out of the loop
        //because in async scenario we will not have control over all
        //fetches and the benefit is that we can blacklist all resources
        //from the bundle instead of retriggering it for consequitive bundles.
        return false;
      }
    }
    return true;
  }
}
