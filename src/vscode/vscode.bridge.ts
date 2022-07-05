export interface DictData {
  [key: string]: any;
}

/**
 * Bridge the data between `vscode` and `web`
 * @class BridgeData
 */
export default class BridgeData {
  cache: DictData;
  syncHandler?: (data: DictData) => void;

  /**
   * Creates an instance of BridgeData.
   * @memberof BridgeData
   */
  constructor() {
    this.cache = {};
    /**
     * Sync handler, post `syncBridgeData` message to `web`
     * @type {(data: {}) => void}
     */
    this.syncHandler = undefined;
  }

  /**
   * Sync all, post `syncBridgeData` message to `web`
   * @returns {this}
   * @memberof BridgeData
   */
  syncAll() {
    this.syncHandler && this.syncHandler(this.cache);
    return this;
  }

  /**
   * Set item
   * @param {string} key
   * @param {any} value
   * @param {boolean} [isSync=true]
   * @returns {this}
   * @memberof BridgeData
   */
  setItem(key: string, value: any, isSync: boolean = true) {
    this.cache[key] = value;
    if (isSync && this.syncHandler) {
      const t: DictData = {};
      t[key] = value;
      this.syncHandler(t);
    }
    return this;
  }

  /**
   * Update items, same as set some items
   * @param {{}} items
   * @param {boolean} [isSync=true]
   * @returns {this}
   * @memberof BridgeData
   */
  updateItems(items: DictData, isSync: boolean = true) {
    for (const key in items) {
      this.setItem(key, items[key], false);
    }
    isSync && this.syncHandler && this.syncHandler(items);
    return this;
  }

  /**
   * Get item
   * @param {string} key
   * @param {any} [dft=undefined] default value
   * @returns
   * @memberof BridgeData
   */
  getItem(key: string, dft?: any) {
    return this.cache[key] || dft;
  }

  /**
   * Remove item by key
   * @param {string} key
   * @returns
   * @memberof BridgeData
   */
  removeItem(key: string) {
    const value = this.cache[key];
    this.cache[key] = undefined;
    return value;
  }

  /**
   * Clear all items
   * @returns {this}
   * @memberof BridgeData
   */
  clear() {
    this.cache = {};
    return this;
  }
}
