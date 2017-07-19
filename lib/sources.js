import { L10nRegistry } from './registry';

/**
 * This is a basic Source for L10nRegistry.
 * It registers its own locales and a pre-path, and when asked for a file
 * it attempts to download and cache it.
 *
 * The Source caches the downloaded files so any consequitive loads will
 * come from the cache.
 **/
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
      return false;
    }

    const fullPath = this.getPath(locale, path);
    if (!this.cache.hasOwnProperty(fullPath)) {
      return undefined;
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

/**
 * This is an extension of the FileSource which should be used
 * for sources that can provide the list of files available in the source.
 *
 * This allows for a faster lookup in cases where the source does not
 * contain most of the files that the app will request for (e.g. an addon).
 **/
export class IndexedFileSource extends FileSource {
  constructor(name, locales, prePath, paths) {
    super(name, locales, prePath);
    this.paths = paths;
  }

  hasFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return false;
    }
    const fullPath = this.getPath(locale, path);
    return this.paths.includes(fullPath);
  }

  async fetchFile(locale, path) {
    if (!this.locales.includes(locale)) {
      return null;
    }

    const fullPath = this.getPath(locale, path);
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

