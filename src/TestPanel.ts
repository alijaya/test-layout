import * as vscode from "vscode";
import * as fs from "fs/promises";

function getWebviewOptions(
  extensionContext: vscode.ExtensionContext
): vscode.WebviewOptions {
  // var localResourceRoots = [
  //   vscode.Uri.joinPath(extensionContext.extensionUri, "web-vue", "dist"),
  // ];
  // var workspaceFolders = vscode.workspace.workspaceFolders?.map((v) => v.uri);
  // if (workspaceFolders) {
  //   localResourceRoots = localResourceRoots.concat(workspaceFolders);
  // }

  return {
    enableScripts: true,
    // localResourceRoots,
  };
}

export default class TestPanel {
  public static currentPanel: TestPanel | undefined;

  public static readonly viewType = "testPanel";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _webview: vscode.Webview;
  private readonly _extensionContext: vscode.ExtensionContext;
  private readonly _extensionUri: vscode.Uri;

  private _cacheHTML: string | undefined;

  public static createOrShow(extensionContext: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    // If we already have a panel, show it.
    if (this.currentPanel?._panel) {
      this.currentPanel.update();
      this.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      this.viewType,
      "Test Panel",
      column ?? vscode.ViewColumn.One,
      getWebviewOptions(extensionContext)
    );

    this.currentPanel = new TestPanel(panel, extensionContext);
  }

  public static revive(
    panel: vscode.WebviewPanel,
    extensionContext: vscode.ExtensionContext
  ) {
    this.currentPanel = new TestPanel(panel, extensionContext);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionContext: vscode.ExtensionContext
  ) {
    this._panel = panel;
    this._webview = panel.webview;
    this._extensionContext = extensionContext;
    this._extensionUri = extensionContext.extensionUri;

    this._webview.options = getWebviewOptions(extensionContext);

    this.update();

    this._panel.onDidDispose(
      () => this.dispose(),
      null,
      extensionContext.subscriptions
    );

    this._panel.onDidChangeViewState(
      (e) => {
        if (this._panel.visible) {
          this.update();
        }
      },
      null,
      extensionContext.subscriptions
    );
  }

  public dispose() {
    TestPanel.currentPanel = undefined;

    this._panel.dispose();
  }

  public async update() {
    const panel = this._panel;
    const webview = this._panel.webview;

    panel.title = "Hello World";
    webview.html = (await this._getHtmlForWebview()) ?? "";
  }

  public async refreshHtmlForWebview() {
    const htmlUri = vscode.Uri.joinPath(
      this._extensionUri,
      "web-vue",
      "dist",
      "index.html"
    );
    let html = await fs.readFile(htmlUri.fsPath, "utf8");
    const baseUri = this._webview
      .asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, "web-vue", "dist", "/")
      )
      .toString();
    html = html.replace("${baseUri}", baseUri);
    this._cacheHTML = html;
    return this._cacheHTML;
  }

  private async _getHtmlForWebview() {
    if (!this._cacheHTML) {
      return await this.refreshHtmlForWebview();
    }
    return this._cacheHTML;
  }

  public loadImage(uri: vscode.Uri) {
    this._webview.postMessage({
      command: "loadImage",
      path: this._webview.asWebviewUri(uri).toString(),
    });
  }
}
