import MessageCenter, { CMD, Handler } from "./web.message";
import { Message } from "./web.message";
import {
  WorkspaceFolder,
  AddWorkspaceFolder,
} from "../../../src/vscode/vscode.webviewApi";

export interface VscodeOrigin {
  postMessage: (msg: Message) => Promise<any> | void;
  setState: (key: string, value: any) => void;
  getState: (key: string) => any;
}

/**
 * @typedef {import('./web.message').Message} Message - Message
 * @typedef {{postMessage: (msg: Message) => void, setState: (key: string, value: any) => void, getState: (key: string) => any}} VscodeOrigin - Origin vscodeApi
 *
 * @typedef {import('../../../../src/vscode/vscode.webviewApi').WorkspaceFolder} WorkspaceFolder
 * @typedef {import('../../../../src/vscode/vscode.webviewApi').AddWorkspaceFolder} AddWorkspaceFolder
 */
/**
 * Vscode api for web
 * @class Vscode
 */
class Vscode {
  origin: VscodeOrigin;
  private _messageCenter: MessageCenter;
  received: MessageCenter["received"];
  post: MessageCenter["post"];
  on: MessageCenter["on"];
  off: MessageCenter["off"];

  constructor() {
    /** @type {VscodeOrigin} */
    this.origin = ((_) => {
      try {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        return acquireVsCodeApi();
      } catch (_) {
        return {
          /**
           * @type {(msg: Message) => void}
           */
          postMessage: (msg) => {
            if (
              msg.cmd === "showMessage" ||
              msg.cmd === "showError" ||
              msg.cmd === "showWarn" ||
              msg.cmd === "showTxt2Output"
            ) {
              console.log(msg.args?.txt);
            } else if (msg.cmd === "showOpenDialog") {
              /* try {
                                let fileEle = document.getElementById('browser-get-file');
                                if (!fileEle) {
                                    const indexEle = document.getElementById('Index');
                                    indexEle.innerHTML += '<input type="file" id="browser-get-file" name="file" style="display: none;" />';
                                    fileEle = document.getElementById('browser-get-file');
                                    fileEle.onchange = function() {
                                        console.log('change ==>');
                                        console.log(this);
                                        console.log(this.files);
                                    };
                                }
                                console.log(fileEle);
                                fileEle.click();
                            } catch (e) {
                                console.error(e.message);
                            } */
              console.log("Not Found: 'acquireVsCodeApi'");
            } else {
              console.log("Not Found: 'acquireVsCodeApi'");
            }
          },
          setState: (key, value) => {
            console.log("Not Found: 'acquireVsCodeApi'");
          },
          getState: (key) => {
            console.log("Not Found: 'acquireVsCodeApi'");
          },
        };
      }
    })();
    // message center
    this._messageCenter = new MessageCenter(this.origin);
    this.received = this.messageCenter.received;
    this.post = this.messageCenter.post;
    this.on = this.messageCenter.on;
    this.off = this.messageCenter.off;
    // @ts-ignore
    window &&
      window.addEventListener &&
      window.addEventListener("message", this.received);
  }
  get messageCenter() {
    return this._messageCenter;
  }

  // Lift Cycle
  onWebviewDidPose(callBack: Handler) {
    // init webview
    this.on(`webviewDidPose`, callBack, 1);
    return this;
  }

  // onwebviewDidDispose(callBack) { // dismiss webview
  //     this.on(`webviewDidDispose`, callBack, 1);
  //     return this;
  // }
  // onwebviewDidChangeViewState(callBack, times=1) {
  //     this.on(`webviewDidChangeViewState`, callBack, times);
  //     return this;
  // }

  /**
   * On recrived message of sync bridge data
   * @param {(msg: Message) => void} callBack
   * @param {number} times
   * @memberof Vscode
   */
  onSyncBridgeData = (callBack: Handler, times = 1) => {
    this.on(`syncBridgeData`, callBack, times);
    return this;
  };

  /**
   * Get bridge data
   * @type {() => Promise<{data: any}>}
   */
  getBridgeData = () => {
    return this.post({ cmd: `getBridgeData` });
  };

  /**
   * Update bridge data
   * @type {(data: any) => void}
   */
  updateBridgeData = (data: any) => {
    this.post({ cmd: `updateBridgeData`, args: data, reply: false });
  };

  /**
   * Get extension path
   * @type {() => Promise<{data: string}>}
   */
  getExtensionPath = () => {
    return this.post({ cmd: `getExtensionPath` });
  };

  /**
   * Get workspace file
   * @type {() => Promise<{data?: string}>}
   */
  getWorkspaceFile = () => {
    return this.post({ cmd: `getWorkspaceFile` });
  };

  /**
   * Get workspace folders
   * @type {() => Promise<{data: WorkspaceFolder[]}>}
   */
  getWorkspaceFolders = () => {
    return this.post({ cmd: `getWorkspaceFolders` });
  };

  /**
   * On recrived message of workspace folders changed
   * @param {(msg: {cmd: 'onDidChangeWorkspaceFolders'}) => void} callBack
   * @param {number} times
   * @memberof Vscode
   */
  onDidChangeWorkspaceFolders = (callBack: Handler, times = 1) => {
    this.on(`onDidChangeWorkspaceFolders`, callBack, times);
    return this;
  };

  /**
   * Update workspace folders
   * @type {(start: number, deleteCount: number, add?: AddWorkspaceFolder[]) => Promise<{data: Boolean}>}
   */
  updateWorkspaceFolders = (
    start: number,
    deleteCount: number,
    add?: AddWorkspaceFolder[]
  ) => {
    return this.post({
      cmd: `updateWorkspaceFolders`,
      args: { start, deleteCount, add },
    });
  };

  /**
   * Get storage path
   * @type {() => Promise<{data: string}>}
   */
  getStoragePath = () => {
    return this.post({ cmd: `getStoragePath` });
  };

  /**
   * Get global storage path
   * @type {() => Promise<{data: string}>}
   */
  getGlobalStoragePath = () => {
    return this.post({ cmd: `getGlobalStoragePath` });
  };

  /**
   * Get workspace state
   * @type {() => Promise<{data: {[name: string]: any}}>}
   */
  getWorkspaceState = () => {
    return this.post({ cmd: `getWorkspaceState` });
  };

  /**
   * Update workspace state
   * @type {(states: any) => void}
   */
  updateWorkspaceState = (states: any) => {
    this.post({ cmd: `updateWorkspaceState`, args: states, reply: false });
  };

  /**
   * Get global state
   * @type {() => Promise<{data: {[name: string]: any}}>}
   */
  getGlobalState = () => {
    return this.post({ cmd: `getGlobalState` });
  };

  /**
   * Update global state
   * @type {(states: any) => void}
   */
  updateGlobalState = (states: any) => {
    this.post({ cmd: `updateGlobalState`, args: states, reply: false });
  };

  /**
   * Find file in current workspace
   * @type {({include, exclude}: {include: string, exclude?: string}) => Promise<{data?: string[]}>}
   */
  findFileInWorkspace = ({
    include,
    exclude = undefined,
  }: {
    include: string;
    exclude?: string;
  }) => {
    return this.post({
      cmd: `findFileInWorkspace`,
      args: { include, exclude },
    });
  };

  /**
   * Get current platform
   * @typedef {import('../../../../src/vscode/vscode.utils').Platform} Platform
   * @type {() => Promise<{data: Platform}>}
   */
  getPlatform = () => {
    return this.post({ cmd: `getPlatform` });
  };

  /**
   * Show message alert
   * @type {({txt, ouput, btns}: {txt: string, ouput?: boolean, btns?: string[]}) => Promise<{data: string}>}
   */
  showMessage = ({
    txt,
    output = false,
    btns = undefined,
  }: {
    txt: string;
    output?: boolean;
    btns?: string[];
  }) => {
    output && this.showTxt2Output({ txt });
    return this.post({
      cmd: `showMessage`,
      args: { txt, btns },
      reply: !!btns,
    });
  };

  /**
   * Show error alert
   * @type {({txt, ouput, btns}: {txt: string|Error, ouput?: boolean, btns?: string[]}) => Promise<{data: string}>}
   */
  showError = ({
    txt,
    output = false,
    btns = undefined,
  }: {
    txt: string | Error;
    output?: boolean;
    btns?: string[];
  }) => {
    if (txt && typeof txt !== "string") {
      txt = txt["message"] || txt.toString();
    }
    output && this.showTxt2Output({ txt });
    return this.post({ cmd: `showError`, args: { txt, btns }, reply: !!btns });
  };

  /**
   * Show warn alert
   * @type {({txt, ouput, btns}: {txt: string, ouput?: boolean, btns?: string[]}) => Promise<{data: string}>}
   */
  showWarn = ({
    txt,
    output = false,
    btns = undefined,
  }: {
    txt: string;
    output?: boolean;
    btns?: string[];
  }) => {
    output && this.showTxt2Output({ txt });
    return this.post({ cmd: `showWarn`, args: { txt, btns }, reply: !!btns });
  };

  /**
   * Show open dialog, select a or some local files or folders
   * @param {showOpenDialogOptions} any
   * @typedef {{canSelectFiles?: boolean, canSelectFolders?: boolean, canSelectMany?: boolean, defaultUri?: string, filters?: {[name: string]: string[]}, openLabel?: string}} showOpenDialogOptions
   * @property {{[name: string]: string[]}} filters e.g.: `{'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}`
   * @returns {Promise<{data?: string[]}>}
   */
  showOpenDialog = ({
    canSelectFiles = true,
    canSelectFolders = false,
    canSelectMany = false,
    defaultUri = undefined,
    filters = undefined,
    openLabel = undefined,
  }: {
    canSelectFiles?: boolean;
    canSelectFolders?: boolean;
    canSelectMany?: boolean;
    defaultUri?: string;
    filters?: { [name: string]: string[] };
    openLabel?: string;
  }) => {
    return this.post({
      cmd: `showOpenDialog`,
      args: {
        canSelectFiles,
        canSelectFolders,
        canSelectMany,
        defaultUri,
        filters,
        openLabel,
      },
    });
  };

  /**
   * Show save dialog, select a local file path
   * @type {({defaultUri, filters, saveLabel}: {defaultUri?: string, filters?: {string: string[]}, saveLabel?: string}) => Promise<{data?: string}>}
   * @property filters e.g.: {'Images': ['png', 'jpg'], 'TypeScript': ['ts', 'tsx']}
   */
  showSaveDialog = ({
    defaultUri = undefined,
    filters = undefined,
    saveLabel = undefined,
  }: {
    defaultUri?: string;
    filters?: { string: string[] };
    saveLabel?: string;
  }) => {
    return this.post({
      cmd: `showSaveDialog`,
      args: { defaultUri, filters, saveLabel },
    });
  };

  /**
   * Show file
   * @type {({filePath, viewColumn, preserveFocus, preview, revealRange, revealType}: {filePath: string, viewColumn?: import('vscode').ViewColumn, preserveFocus?: boolean, preview?: boolean, revealRange?: {startLine?: Number, endLine?: Number}, revealType?: import('vscode').TextEditorRevealType}) => void}
   */
  showTextDocument = ({
    filePath,
    viewColumn = 1,
    preserveFocus = false,
    preview = false,
    revealRange = undefined,
    revealType = 0,
  }: {
    filePath: string;
    viewColumn?: number;
    preserveFocus?: boolean;
    preview?: boolean;
    revealRange?: { startLine?: number; endLine?: number };
    revealType?: number;
  }) => {
    const args = {
      filePath,
      viewColumn,
      preserveFocus,
      preview,
      revealRange,
      revealType,
    };
    this.post({ cmd: `showTextDocument`, args, reply: false });
  };

  /**
   * Show txt to output
   * @type {({txt, preserveFocus, line}: {txt: string, preserveFocus?: boolean, line?: boolean, show?: boolean}) => void}
   */
  showTxt2Output = ({
    txt,
    preserveFocus = true,
    line = true,
    show = true,
  }: {
    txt: string;
    preserveFocus?: boolean;
    line?: boolean;
    show?: boolean;
  }) => {
    this.post({
      cmd: `showTxt2Output`,
      args: { txt, preserveFocus, line, show },
      reply: false,
    });
  };

  /**
   * Send cmd to terminal
   * @type {({cmd, addNewLine, preserveFocus}: {cmd: string, addNewLine?: boolean, preserveFocus?: boolean}) => void}
   */
  sendCmd2Terminal = ({
    cmd,
    addNewLine = true,
    preserveFocus = false,
  }: {
    cmd: string;
    addNewLine?: boolean;
    preserveFocus?: boolean;
  }) => {
    this.post({
      cmd: `sendCmd2Terminal`,
      args: { cmd, addNewLine, preserveFocus },
      reply: false,
    });
  };

  /**
   * a File or folder if exists
   * @type {({path}: {path: string}) => Promise<{data: boolean}>}
   */
  exists4Path = ({ path }: { path: string }) => {
    return this.post({ cmd: `exists4Path`, args: { path } });
  };

  /**
   * Get stat for path
   * @type {({path}: {path: string}) => Promise<{data: {error?: string, data: undefined|{isFile: boolean, isDirectory: boolean, isSymbolicLink: boolean}}>}
   */
  getStat4Path = ({ path }: { path: string }) => {
    return this.post({ cmd: `getStat4Path`, args: { path } });
  };

  /**
   * Read file
   * @type {({path, options}: {path: string, options?: 'hex'|'json'|'string'}) => Promise<{data: {error?: string, data: any}}>}
   */
  readFile = ({
    path,
    options = undefined,
  }: {
    path: string;
    options?: "hex" | "json" | "string";
  }) => {
    return this.post({ cmd: `readFile`, args: { path, options } });
  };

  /**
   * Write file
   * @type {({path, data, options}: {path: string, data: string|[]|{}, options?: {encoding?: string|undefined, mode?: number|string, flag?: string}|string|undefined}) => Promise<{data: {error?: string|undefined}}>}
   */
  writeFile = ({
    path,
    data,
    options = undefined,
  }: {
    path: string;
    data: string | [] | {};
    options?:
      | { encoding?: string | undefined; mode?: number | string; flag?: string }
      | string
      | undefined;
  }) => {
    return this.post({ cmd: `writeFile`, args: { path, data, options } });
  };

  /**
   * Request
   * @type {({}: {url: string, method?: string, data?: {}, headers?: {}}) => Promise<{data: {error?: string, body: any, statusCode: number, statusMessage:string}}>}
   */
  request = ({
    url,
    method = "POST",
    data = undefined,
    headers = { "content-type": "application/json" },
  }: {
    url: string;
    method?: string;
    data?: {};
    headers?: {};
  }) => {
    return this.post({ cmd: `request`, args: { url, method, data, headers } });
  };
}

export default Vscode;
