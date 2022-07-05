import Vscode from "./web.vscode";

/* eslint-disable spaced-comment */
/**
 * @typedef {import('./web.vscode').default} Vscode Vscode hook in web
 */

/**
 * Global state, for saving and synchronizing global state of `vscode`
 * @class GlobalState
 */
class GlobalState {
  _vscode?: Vscode;
  public data: any;

  /**
   * Creates an instance of GlobalState.
   * @param {Vscode} [vscode=undefined]
   * @memberof GlobalState
   */
  constructor(vscode?: Vscode) {
    this._vscode = vscode;
    this.data = {};
  }
  get vscode() {
    return this._vscode;
  }

  /**
   * Update state
   * @private
   * @param {{}} state
   * @param {boolean} isSync
   * @memberof GlobalState
   */
  _update = (state: any, isSync: boolean) => {
    if (!this.data) {
      return this;
    }
    for (const key in state) {
      if (state.hasOwnProperty(key)) {
        this.data[key] = state[key];
      }
    }
    isSync && this.sync(state);
    return this;
  };

  /**
   * Update state
   * @param {{}} state
   * @memberof GlobalState
   */
  update = (state: any) => {
    return this._update(state, true);
  };

  /**
   * Activate
   * @param {Vscode} [vscode=undefined]
   * @memberof GlobalState
   */
  activate = (vscode?: Vscode) => {
    this._vscode = vscode;
    this.data &&
      this.vscode?.getGlobalState()?.then((msg) => {
        msg.data && this._update(msg.data, false);
      });
    return this;
  };

  /**
   * Deactivate
   * @memberof GlobalState
   */
  deactivate = () => {
    this._vscode = undefined;
    this.data = undefined;
  };

  /**
   * Sync state
   * @param {{}} state
   * @memberof GlobalState
   */
  sync = (state: any) => {
    this.vscode?.updateGlobalState(state);
  };
}

class WorkspaceState extends GlobalState {
  /**
   * Activate
   * @param {Vscode} [vscode=undefined]
   * @memberof GlobalState
   */
  activate = (vscode?: Vscode) => {
    this._vscode = vscode;
    this.data &&
      this.vscode?.getWorkspaceState()?.then((msg) => {
        msg.data && this._update(msg.data, false);
      });
    return this;
  };
  sync = (state: any) => {
    this.vscode?.updateWorkspaceState(state);
  };
}

class BridgeData extends GlobalState {
  /**
   * Activate
   * @param {Vscode} [vscode=undefined]
   * @memberof GlobalState
   */
  activate = (vscode?: Vscode) => {
    this._vscode = vscode;
    this.vscode?.onSyncBridgeData((msg) => {
      msg.data && this._update(msg.data, false);
    }, 0);
    this.data &&
      this.vscode?.getBridgeData()?.then((msg) => {
        msg.data && this._update(msg.data, false);
      });
    return this;
  };
  sync = (state: any) => {
    this.vscode?.updateBridgeData(state);
  };
}

class WebviewData {
  __vscode__?: Vscode;
  __globalState__: GlobalState;
  __workspaceState__: WorkspaceState;
  __bridgeData__: BridgeData;
  public platform: NodeJS.Platform;
  public pathSep: "/" | "\\";
  public extensionPath: string;
  public workspaceFile: string;
  public workspaceFolders = [];
  public startPath = "";
  /**
   * Creates an instance of WebviewData.
   * @param {Vscode} [vscode=undefined]
   * @memberof WebviewData
   */
  constructor(vscode?: Vscode) {
    this.__vscode__ = vscode;
    this.__globalState__ = new GlobalState(vscode);
    this.__workspaceState__ = new WorkspaceState(vscode);
    this.__bridgeData__ = new BridgeData(vscode);
    this.$globalState.data = this;
    this.$workspaceState.data = this;
    this.$bridgeData.data = this;

    /**@type {NodeJS.Platform} - current os platform*/
    this.platform = "darwin";
    /**@type {'/' | '\\'} - current path sep */
    this.pathSep = "/";
    /**@type {string} - current extension folder path */
    this.extensionPath = "";
    /**@type {string} - current workspace file */
    this.workspaceFile = "";
    /**@type {import('./web.vscode').WorkspaceFolder[]} - current workspace folders */
    this.workspaceFolders = [];
    /**@type {string} - start path */
    this.startPath = "";
  }
  get $vscode() {
    return this.__vscode__;
  }
  get $globalState() {
    return this.__globalState__;
  }
  get $workspaceState() {
    return this.__workspaceState__;
  }
  get $bridgeData() {
    return this.__bridgeData__;
  }

  /**
   * Activate
   * @param {Vscode} [vscode=undefined]
   * @memberof GlobalState
   */
  $activate(vscode?: Vscode) {
    vscode && (this.__vscode__ = vscode);
    if (!this.$vscode) {
      throw Error("vscode can't be null.");
    }
    this.$globalState.activate(this.$vscode);
    this.$workspaceState.activate(this.$vscode);
    this.$bridgeData.activate(this.$vscode);
    // this.$vscode.onwebviewDidDispose(() => {
    //     this.$deactivate();
    // });
    return this;
  }

  /**
   * Deactivate
   * @memberof WebviewData
   */
  $deactivate() {
    this.$globalState.deactivate();
    this.$workspaceState.deactivate();
    this.$bridgeData.deactivate();
  }
}

export { WebviewData, GlobalState, WorkspaceState, BridgeData };
