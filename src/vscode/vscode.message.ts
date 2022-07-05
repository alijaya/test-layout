import * as vscode from "vscode";

export interface PostMessageObject {
  cmd: string;
  data: any;
}

/**
 * Communication Message from `vscode` to `web`
 * @class Message
 * @typedef {{cmd: string, data: any}} PostMessageObject
 */
export class Message {
  /**
   * Create a new message
   * @static
   * @param {string} cmd
   * @param {any} data
   * @returns {PostMessageObject}
   * @memberof Message
   */
  static create(cmd: string, data: any): PostMessageObject {
    return { cmd, data };
  }

  /**
   * Create a new message of `webviewDidPose`
   * @static
   * @param {any} data
   * @returns {PostMessageObject}
   * @memberof Message
   */
  static webviewDidPose(data: any): PostMessageObject {
    return { cmd: `webviewDidPose`, data };
  }

  /**
   * Create a new message of `webviewDidDispose`
   * @static
   * @param {any} data
   * @returns {PostMessageObject}
   * @memberof Message
   */
  static webviewDidDispose(data: any): PostMessageObject {
    return { cmd: `webviewDidDispose`, data };
  }

  /**
   * Create a new message of `webviewDidChangeViewState`
   * @static
   * @param {any} data
   * @returns {PostMessageObject}
   * @memberof Message
   */
  static webviewDidChangeViewState(data: any): PostMessageObject {
    return { cmd: `webviewDidChangeViewState`, data };
  }

  /**
   * Create a new message of `syncBridgeData`
   * @static
   * @param {any} data
   * @returns {PostMessageObject}
   * @memberof Message
   */
  static syncBridgeData(data: any): PostMessageObject {
    return { cmd: `syncBridgeData`, data };
  }
}

export interface ReceivedMessageObject {
  cmd: string;
  args: object;
  reply: boolean;
  data?: any;
}

/**
 * Received Message from `web` to `vscode`
 * @typedef {{cmd: string, args: {}, reply: boolean, data?: any}} ReceivedMessageObject
 */

interface Api {
  [cmd: string]: (args: object) => Promise<any> | any;
}

/**
 * Handler to received message from `web` to `vscode`
 * @class Handler
 */
export class Handler {
  private _Api: Api;

  received: (poster: vscode.Webview, message: ReceivedMessageObject) => void;

  /**
   * Creates an instance of Handler.
   * @memberof Handler
   */
  constructor() {
    this._Api = {};
    /**
     * Handler to received message
     * @type {(poster: import('vscode').Webview, message: ReceivedMessageObject) => void}
     */
    this.received = (poster, message) => {
      const cmd = message.cmd;
      const args = message.args;
      const func = ((_) => {
        if (this.Api.hasOwnProperty(cmd) && this.Api[cmd]) {
          return this.Api[cmd];
        }
        return undefined;
      })();
      if (func) {
        const p = func(args);
        if (message.reply && poster) {
          if (p) {
            if (typeof p.then === "function") {
              p.then((data: any) => {
                message.data = data;
                poster.postMessage(message);
              });
            } else {
              message.data = p;
              poster.postMessage(message);
            }
          } else {
            poster.postMessage(message);
          }
        }
      }
    };
  }
  get Api() {
    return this._Api;
  }
  /**
   * Add api
   * @param {object} obj
   * @memberof Handler
   */
  addApi(obj: Api) {
    if (obj instanceof Object) {
      const Api = obj;
      for (const key in Api) {
        if (Api.hasOwnProperty(key)) {
          this.Api[key] = Api[key];
        }
      }
    }
  }
}
