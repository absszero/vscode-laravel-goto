import * as vscode from 'vscode';
import { HoverProvider } from './HoverProvider';
import Command from './Command';

export function activate(context: vscode.ExtensionContext) {
	const php: vscode.DocumentFilter = {
		language: "php",
		scheme: "file"
	};

	const hoverDispose = vscode.languages.registerHoverProvider(php, new HoverProvider());
	context.subscriptions.push(hoverDispose);

	const commandDispose = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto', Command);
	context.subscriptions.push(commandDispose);
}
// this method is called when your extension is deactivated
export function deactivate() {}

