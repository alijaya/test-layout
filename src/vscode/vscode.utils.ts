import * as vscode from "vscode";
import WebviewApi from "./vscode.webviewApi";

export default class Utils {
  static _diagnosticCollection?: vscode.DiagnosticCollection;

  static get Api() {
    return WebviewApi;
  }
  static get bridgeData() {
    return this.Api.bridgeData;
  }
  static get context() {
    return this.Api.context;
  }
  static get extName() {
    return this.Api.name;
  }
  static get diagnosticCollection() {
    return (
      this._diagnosticCollection ||
      (this._diagnosticCollection = vscode.languages.createDiagnosticCollection(
        this.extName
      ))
    );
  }
}
