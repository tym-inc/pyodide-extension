// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PyodideRunner } from './pyodideRunner';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const runner = new PyodideRunner(context);
	context.subscriptions.push(
		vscode.commands.registerCommand("pyodide.runFile", (fileUri?: vscode.Uri) => {
			
			if (fileUri) {
				runner.runFile(fileUri);
			} else if (vscode.window.activeTextEditor?.document.languageId === 'python') {
				runner.runFile(vscode.window.activeTextEditor.document.uri);
			}
		}),
		vscode.commands.registerCommand("pyodide.stop", () => runner.stop())
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
