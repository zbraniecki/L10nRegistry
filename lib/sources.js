export class FileSource {
  constructor(name, prePath) {
    this.name = name;
    this.prePath = prePath;
    this.cache = {};
  }

  getPath(locale, path) {
    return this.prePath.replace('{locale}', locale) + path;
  }

  hasFile(locale, path) {
    const fullPath = this.getPath(locale, path);
    if (this.cache[fullPath] === null) {
      return false;
    }
    if (this.cache.hasOwnProperty(fullPath)) {
      return true;
    }
    return;
  }

  fetchFile(locale, path) {
    const fullPath = this.getPath(locale, path);
    if (!this.cache.hasOwnProperty(fullPath)) {
      let file = this.fs[fullPath];

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
  constructor(name, prePath) {
    this.name = name;
    this.prePath = prePath;
  }

  hasFile(locale, path) {
    let fullPath = this.prePath.replace('{locale}', locale) + path;
    return this.fs.hasOwnProperty(fullPath);
  }

  fetchFile(locale, path) {
    let fullPath = this.prePath.replace('{locale}', locale) + path;
    if (this.fs.hasOwnProperty(fullPath)) {
      return this.fs[fullPath];
    } else {
      return null;
    }
  }
}

