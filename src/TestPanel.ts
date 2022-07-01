import * as vscode from 'vscode';

function getWebviewOptions(extensionContext: vscode.ExtensionContext): vscode.WebviewOptions {
  var localResourceRoots = [vscode.Uri.joinPath(extensionContext.extensionUri, 'media')];
  var workspaceFolders = vscode.workspace.workspaceFolders?.map(v => v.uri);
  if (workspaceFolders) {
    localResourceRoots = localResourceRoots.concat(workspaceFolders);
  }

  return {
    enableScripts: true,
    localResourceRoots
  };
}

export default class TestPanel {
  public static currentPanel: TestPanel | undefined;

  public static readonly viewType = 'testPanel';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _webview: vscode.Webview;
  private readonly _extensionContext: vscode.ExtensionContext;
  private readonly _extensionUri: vscode.Uri;

  public static createOrShow(extensionContext: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor?.viewColumn;

    // If we already have a panel, show it.
    if (this.currentPanel?._panel) {
      this.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panle.
    const panel = vscode.window.createWebviewPanel(
      this.viewType,
      'Test Panel',
      column ?? vscode.ViewColumn.One,
      getWebviewOptions(extensionContext),
    );

    this.currentPanel = new TestPanel(panel, extensionContext);
  }

  public static revive(panel: vscode.WebviewPanel, extensionContext: vscode.ExtensionContext) {
    this.currentPanel = new TestPanel(panel, extensionContext);
  }

  private constructor(panel: vscode.WebviewPanel, extensionContext: vscode.ExtensionContext) {
    this._panel = panel;
    this._webview = panel.webview;
    this._extensionContext = extensionContext;
    this._extensionUri = extensionContext.extensionUri;

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, extensionContext.subscriptions);
  
    this._panel.onDidChangeViewState( e => {
      if (this._panel.visible) {
        this._update();
      }
    },
    null,
    extensionContext.subscriptions);
  }

  public dispose() {
    TestPanel.currentPanel = undefined;

    this._panel.dispose();
  }

  private _update() {
    const panel = this._panel;
    const webview = this._panel.webview;
    
    panel.title = "Hello World";
    webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Panel</title>
      </head>
      <body>
        <h1>Add Image</h1>
        <input id="pathInput" />
        <button id="addButton">Add Image</button>
        <div id="imageList"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }

  public loadImage(uri: vscode.Uri) {
    this._webview.postMessage({
      command: "loadImage",
      path: this._webview.asWebviewUri(uri).toString()
    });
  }
}