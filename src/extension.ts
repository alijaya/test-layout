// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import TestPanel from "./TestPanel";
import TestWebview from "./TestWebview";
import * as path from "path";
import utils from "./vscode/vscode.utils";

const webview = new TestWebview();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(webview);
  webview.activate(
    context,
    "Test Webview",
    "testPanel",
    path.join(context.extensionPath, "web-vue", "dist", "index.html")
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("testPanel.openExternal", () => {
      vscode.env.openExternal(
        vscode.Uri.parse("https://code.visualstudio.com")
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("testPanel.helloWorld", () => {
      utils.Api.showMessage({ txt: "Hello World!" });
    })
  );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand("testPanel.start", () => {
  //     TestPanel.createOrShow(context);
  //   })
  // );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand("testPanel.hello", (uri: vscode.Uri) => {
  //     TestPanel.currentPanel?.loadImage(uri);
  //   })
  // );

  // context.subscriptions.push(
  //   vscode.window.registerWebviewPanelSerializer(TestPanel.viewType, {
  //     async deserializeWebviewPanel(
  //       webviewPanel: vscode.WebviewPanel,
  //       state: any
  //     ) {
  //       TestPanel.revive(webviewPanel, context);
  //     },
  //   })
  // );
}

// this method is called when your extension is deactivated
export function deactivate() {
  webview.deactivate();
}
