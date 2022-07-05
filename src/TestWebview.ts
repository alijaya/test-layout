import { ExtensionContext } from "vscode";
import { WebView } from "./vscode/vscode.webview";

export default class TestWebview extends WebView {
  constructor() {
    super();
    this.handler.addApi({
      // api1: () => {},
      // api2: () => {}
    });
  }

  activate(
    context: ExtensionContext,
    name: string,
    cmdName: string,
    htmlPath?: string | undefined
  ): this {
    return super.activate(context, name, cmdName, htmlPath);
  }
}
