import * as vscode from 'vscode';
import { HoverProvider } from './HoverProvider';
import Command from './Command';
import { Router } from './Router';
import { setDevMode } from './Logging';
import { newWindow, openAllfiles} from './OpenCommand';

export function activate(context: vscode.ExtensionContext) {
	setDevMode(context.extensionMode);

	const hoverDispose = vscode.languages.registerHoverProvider(HoverProvider.documentFilter(), new HoverProvider());
	context.subscriptions.push(hoverDispose);

	const commandDispose = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto', Command);
	context.subscriptions.push(commandDispose);

	const newWindowDispose = vscode.commands.registerCommand(
		'extension.vscode-laravel-goto.new-window',
		(args) => newWindow(context, args)
	);
	context.subscriptions.push(newWindowDispose);
	openAllfiles(context);

	const router = new Router;
	router.update();
	const watcher = router.watch();
	context.subscriptions.push(watcher);
}
// this method is called when your extension is deactivated
export function deactivate() {}

