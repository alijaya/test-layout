import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import * as fs from "fs/promises";
import BridgeData from "./vscode.bridge";
import {
  Message,
  Handler,
  PostMessageObject,
  ReceivedMessageObject,
} from "./vscode.message";
import WebviewApi from "./vscode.webviewApi";

/**
 * @typedef {import('./vscode.message').PostMessageObject} PostMessageObject
 * @typedef {import('./vscode.message').ReceivedMessageObject} ReceivedMessageObject
 * WebView
 * @class WebView
 */
export class WebView {
  private _handler: Handler;
  private _panel: vscode.WebviewPanel | undefined;
  private _bridgeData: BridgeData;
  private _uri?: vscode.Uri;

  onDidPose?: (uri: vscode.Uri) => void;
  onDidDispose?: () => void;
  onDidChangeViewState?: (state: any) => void;
  onDidReceiveMessage?: (message: ReceivedMessageObject) => void;
  /**
   * Creates an instance of WebView.
   * @param {Handler} [handler=new Handler()]
   * @memberof WebView
   */
  constructor(handler = new Handler()) {
    this._handler = handler;
    this._handler.addApi(WebviewApi as any);
    this._panel = undefined;
    this._bridgeData = new BridgeData();
    this._bridgeData.syncHandler = (data) => {
      this.postMessage(Message.syncBridgeData(data));
    };
    /**
     * @type {(uri: vscode.Uri) => void}
     */
    this.onDidPose = undefined;
    /**
     * @type {() => void}
     */
    this.onDidDispose = undefined;
    /**
     * @type {(state: any) => void}
     */
    this.onDidChangeViewState = undefined;
    /**
     * @type {(message: ReceivedMessageObject) => void}
     */
    this.onDidReceiveMessage = undefined;
  }
  get name() {
    return WebviewApi.name;
  }
  get handler() {
    return this._handler;
  }
  get panel() {
    return this._panel;
  }
  get bridgeData() {
    return this._bridgeData;
  }
  get uri() {
    return this._uri;
  }

  /**
   * Show panel
   * @param {vscode.ExtensionContext} context
   * @param {string} htmlPath
   * @param {string} [viewType=this.name]
   * @param {string} [title=this.name]
   * @param {number} [viewColumn=vscode.ViewColumn.Three]
   * @param {boolean} [enableScripts=true]
   * @param {boolean} [retainContextWhenHidden=true]
   * @memberof WebView
   */
  showPanel(
    context: vscode.ExtensionContext,
    htmlPath: string,
    viewType: string = this.name ?? "",
    title: string = this.name ?? "",
    viewColumn: number = vscode.ViewColumn.Three,
    enableScripts: boolean = true,
    retainContextWhenHidden: boolean = true
  ) {
    if (this.panel) {
      this.panel.reveal(viewColumn);
    } else {
      this._panel = vscode.window.createWebviewPanel(
        viewType,
        title,
        viewColumn, // show in position of editor
        {
          enableScripts, // default disabled
          retainContextWhenHidden, // keep state and avoid being reset When hidden webview
          localResourceRoots: [vscode.Uri.file(path.dirname(htmlPath))], //  be allowed load resource paths.
        }
      );
      // load html
      this.getHtml4Path(htmlPath).then(
        (html) => this._panel && (this._panel.webview.html = html)
      );
      // this._panel.webview.html = this.getHtml4Path(htmlPath);
      this._panel.onDidDispose(
        () => this.didDispose(),
        undefined,
        context.subscriptions
      );
      // on webview visibility changed or position changed
      this._panel.onDidChangeViewState(
        (state) => this.didChangeViewState(state),
        undefined,
        context.subscriptions
      );
      this._panel.webview.onDidReceiveMessage(
        (message) => this.didReceiveMessage(message),
        undefined,
        context.subscriptions
      );
    }
  }

  /**
   * Post message
   * @param {PostMessageObject} message
   * @memberof WebView
   */
  postMessage(message: PostMessageObject) {
    this.panel && this.panel.webview.postMessage(message);
  }

  /**
   * On did receive message
   * @param {ReceivedMessageObject} message
   * @memberof WebView
   */
  didReceiveMessage(message: ReceivedMessageObject) {
    this.handler &&
      this.handler.received &&
      this.panel &&
      this.handler.received(this.panel.webview, message);
    this.onDidReceiveMessage && this.onDidReceiveMessage(message);
    console.log(`Extension(${this.name}) received message: ${message.cmd}`);
  }

  /**
   * On did change view state
   * @param {*} state
   * @memberof WebView
   */
  didChangeViewState(state: any) {
    // const p = state.panel;
    this.onDidChangeViewState && this.onDidChangeViewState(state);
    // this.postMessage(Message.webviewDidChangeViewState(undefined));
    console.log(`Webview(${this.name}) did changeView state.`);
  }

  /**
   * On did dispose
   * @memberof WebView
   */
  didDispose() {
    this._panel = undefined;
    this.onDidDispose && this.onDidDispose();
    console.log(`Webview(${this.name}) did dispose.`);
  }

  /**
   * Activate
   * @param {vscode.ExtensionContext} context vscode extension context
   * @param {string} name webview name
   * @param {string} cmdName cmd name
   * @param {string} [htmlPath=path.join(context.extensionPath, 'web', 'dist', 'index.html')] html path
   * @returns {this}
   * @memberof WebView
   */
  activate(
    context: vscode.ExtensionContext,
    name: string,
    cmdName: string,
    htmlPath?: string
  ) {
    // activate WebviewApi
    WebviewApi.activate(context, name, this.bridgeData);
    htmlPath ||
      (htmlPath = path.join(
        context.extensionPath,
        "web",
        "dist",
        "index.html"
      ));
    htmlPath =
      htmlPath ?? path.join(context.extensionPath, "web", "dist", "index.html");
    context.subscriptions.push(
      vscode.commands.registerCommand(cmdName, (uri) => {
        this._uri = uri;
        this.showPanel(context, htmlPath ?? "");
        this.bridgeData.updateItems(
          {
            platform: os.platform(),
            pathSep: path.sep,
            extensionPath: context.extensionPath,
            workspaceFile: vscode.workspace.workspaceFile
              ? vscode.workspace.workspaceFile.fsPath
              : "",
            workspaceFolders:
              vscode.workspace.workspaceFolders?.map((wf) => {
                return {
                  index: wf.index,
                  name: wf.name,
                  folder: wf.uri.fsPath,
                };
              }) ?? [],
            startPath: uri ? uri.fsPath : "",
          },
          false
        );
        this.bridgeData.syncAll();
        this.onDidPose && this.onDidPose(uri);
        this.postMessage(Message.webviewDidPose(undefined));
      }),
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.bridgeData.updateItems(
          {
            workspaceFolders:
              vscode.workspace.workspaceFolders?.map((wf) => {
                return {
                  index: wf.index,
                  name: wf.name,
                  folder: wf.uri.fsPath,
                };
              }) ?? [],
          },
          true
        );
        this.postMessage({
          cmd: `onDidChangeWorkspaceFolders`,
          data: undefined,
        });
      })
    );
    return this;
  }

  deactivate() {
    WebviewApi.deactivate();
  }

  /**
   *Get html from the file path and replace resources protocol to `vscode-resource`
   *
   * @param {string} htmlPath path of html path
   * @returns
   * @memberof WebView
   */
  async getHtml4Path(htmlPath: string) {
    // 兼容`v1.38+`
    // `vscode-resource`无法加载？用`vscode-webview-resource`替换，未在文档上查到`vscode-webview-resource`，根据`panel.webview.asWebviewUri(htmlPath)`获得
    // const scheme = this.panel?.webview.cspSource
    //   ? this.panel.webview.cspSource.split(":")[0]
    //   : "vscode-resource";
    // const dirPath = path.dirname(htmlPath);
    // let html = fs.readFileSync(htmlPath, "utf-8");
    // html = html.replace(/(href=|src=)(.+?)(\ |>)/g, (m, $1, $2, $3) => {
    //   let uri = $2;
    //   uri = uri.replace('"', "").replace("'", "");
    //   uri.indexOf("/static") === 0 && (uri = `.${uri}`);
    //   if (uri.substring(0, 1) === ".") {
    //     const furi = vscode.Uri.file(path.resolve(dirPath, uri));
    //     if (this.panel?.webview.asWebviewUri) {
    //       uri = `${$1}${this.panel.webview.asWebviewUri(furi)}${$3}`;
    //     } else {
    //       uri = `${$1}${furi.with({ scheme }).toString()}${$3}`;
    //     }
    //     return uri.replace("%22", "");
    //   }
    //   return m;
    // });
    // return html;

    let html = await fs.readFile(htmlPath, "utf8");
    // const dirPath = path.dirname(htmlPath);
    html = html.replace(
      "${baseUri}",
      this.panel?.webview.asWebviewUri(vscode.Uri.file(htmlPath)).toString() ??
        ""
    );
    return html;

    // Use asExternalUri to get the URI for the web server
    // const dynamicWebServerPort = 3000;
    // const fullWebServerUri = await vscode.env.asExternalUri(
    //   vscode.Uri.parse(`http://localhost:${dynamicWebServerPort}`)
    // );

    // const cspSource = this.panel?.webview.cspSource;
    // return `<!DOCTYPE html>
    //     <head>
    //         <meta
    //             http-equiv="Content-Security-Policy"
    //             content="default-src 'none'; frame-src ${fullWebServerUri} ${cspSource} https:; img-src ${cspSource} https:; script-src ${cspSource}; style-src ${cspSource};"
    //         />
    //     </head>
    //     <body>
    //     <!-- All content from the web server must be in an iframe -->
    //     <iframe src="${fullWebServerUri}">
    // </body>
    // </html>`;
  }
}
