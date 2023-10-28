import * as vscode from 'vscode';
import { HoverProvider } from './HoverProvider';
import Command from './Command';
import { Router } from './Router';
import { Logging } from './Logging';

export function activate(context: vscode.ExtensionContext) {
	(new Logging()).setDevMode(context.extensionMode);

	const hoverDispose = vscode.languages.registerHoverProvider(HoverProvider.documentFilter(), new HoverProvider());
	context.subscriptions.push(hoverDispose);

	const commandDispose = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto', Command);
	context.subscriptions.push(commandDispose);

	const router = new Router;
	router.update();
	const watcher = router.watch();
	context.subscriptions.push(watcher);
}
// this method is called when your extension is deactivated
export function deactivate() {}

