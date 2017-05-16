import { L10nRegistry } from './registry';

export class FileSource {
  constructor(name, locales, prePath, packages = []) {
    this.name = name;
    this.locales = locales;
    this.packages = packages;
    this.prePath = prePath;
    this.cache = {};
  }

  getPath(locale, path) {
    return (this.prePath + path).replace(/\{locale\}/g, locale);
  }

  hasFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return false;
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

  fetchFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return null;
    }

    const fullPath = this.getPath(locale, path);
    if (this.hasFile(locale, path) === undefined) {
      let file = L10nRegistry.load(fullPath);

      if (file === undefined) {
        this.cache[fullPath] = null;
      } else {
        this.cache[fullPath] = file;
      }
    }
    return this.cache[fullPath];
  }
}

export class IndexedFileSource {
  constructor(name, locales, prePath, paths, packages = []) {
    this.name = name;
    this.locales = locales;
    this.packages = packages;
    this.prePath = prePath;
    this.paths = paths;
  }

  getPath(locale, path) {
    return (this.prePath + path).replace(/\{locale\}/g, locale);
  }

  hasFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return false;
    }
    const fullPath = this.getPath(locale, path);
    return this.paths.includes(fullPath);
  }

  fetchFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return null;
    }

    const fullPath = this.getPath(locale, path);
    if (this.paths.includes(fullPath)) {
      let file = L10nRegistry.load(fullPath);

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

