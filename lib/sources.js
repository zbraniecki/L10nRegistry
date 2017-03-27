import { L10nRegistry } from './registry';

export class FileSource {
  constructor(name, locales, prePath) {
    this.name = name;
    this.locales = locales;
    this.prePath = prePath;
    this.cache = {};
  }

  getPath(locale, path) {
    return (this.prePath + path).replace(/\{locale\}/g, locale);
  }

  hasFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return null;
    }

    const fullPath = this.getPath(locale, path);
    if (!this.cache.hasOwnProperty(fullPath)) {
      return;
    }

    if (this.cache[fullPath] === null) {
      return false;
    }
    return true;
  }

  async fetchFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return null;
    }

    const fullPath = this.getPath(locale, path);
    if (this.hasFile(locale, path) === undefined) {
      let file = await L10nRegistry.load(fullPath);

      if (file === undefined) {
        this.cache[fullPath] = null;
      } else {
        this.cache[fullPath] = file;
      }
    }
    return this.cache[fullPath];
  }
}

export class AddonSource {
  constructor(name, locales, prePath, paths) {
    this.name = name;
    this.locales = locales;
    this.prePath = prePath;
    this.paths = paths;
  }

  hasFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return false;
    }
    let fullPath = (this.prePath + path).replace(/\{locale\}/g, locale);
    return this.paths.includes(fullPath);
  }

  async fetchFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return null;
    }

    const fullPath = (this.prePath + path).replace(/\{locale\}/g, locale);
    if (this.paths.includes(fullPath)) {
      let file = await L10nRegistry.load(fullPath);

      if (file === undefined) {
        return null;
      } else {
        return file;
      }
    } else {
      return null;
    }
  }
}

