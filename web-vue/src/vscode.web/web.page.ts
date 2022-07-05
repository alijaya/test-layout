import { EventEmitter } from "events";

export type PageCallBack = (show: number, hide: number) => void;

class Page {
  _number: number;
  _eventEmitter: EventEmitter;
  __to__?: PageCallBack;

  constructor() {
    this._number = 0;
    this._eventEmitter = new EventEmitter();
  }
  get number() {
    return this._number;
  }
  get eventEmitter() {
    return this._eventEmitter;
  }
  static getShowIdentifier(number: number) {
    return `show_page_${number}`;
  }
  static getHideIdentifier(number: number) {
    return `hide_page_${number}`;
  }

  /**
   * On to page
   * @param {PageCallBack} callBack
   * @typedef {(show: number, hide: number) => void} PageCallBack
   * @returns
   * @memberof Page
   */
  onTo(callBack: PageCallBack) {
    if (!callBack) {
      return this;
    }
    this.__to__ = callBack;
    return this;
  }

  /**
   * Show page
   * @param {number} to
   * @returns
   * @memberof Page
   */
  show(to: number) {
    if (this._number === to) {
      return this;
    }
    const from = this._number;
    this._number = to;
    return this._emit(to, from);
  }

  /**
   * On show page
   * @param {number} pageNumber
   * @param {PageCallBack} callBack
   * @memberof Page
   */
  onShow(pageNumber: number, callBack: PageCallBack) {
    callBack &&
      this.eventEmitter.on(Page.getShowIdentifier(pageNumber), (data) => {
        callBack(data.show, data.hide);
      });
  }

  /**
   * On hide page
   * @param {number} pageNumber
   * @param {PageCallBack} callBack
   * @memberof Page
   */
  onHide(pageNumber: number, callBack: PageCallBack) {
    callBack &&
      this.eventEmitter.on(Page.getHideIdentifier(pageNumber), (data) => {
        callBack(data.show, data.hide);
      });
  }

  /**
   * Emit
   * @private
   * @param {number} show
   * @param {number} hide
   * @returns
   * @memberof Page
   */
  _emit(show: number, hide: number) {
    this.__to__?.(show, hide);
    this.eventEmitter.emit(Page.getHideIdentifier(hide), { show, hide });
    this.eventEmitter.emit(Page.getShowIdentifier(show), { show, hide });
    return this;
  }
}

export default Page;
