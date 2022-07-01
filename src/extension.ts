// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import TestPanel from './TestPanel';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('testPanel.start', () => {
			TestPanel.createOrShow(context);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('testPanel.hello', (uri:vscode.Uri) => {
			TestPanel.currentPanel?.loadImage(uri);
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
