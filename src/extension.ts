import * as vscode from 'vscode';
import { HoverProvider } from './HoverProvider';
import Command from './Command';
import { Router } from './Router';
import { setDevMode } from './Logging';
import { IOpenAllArgs} from './IOpenAllArgs';
import { newWindow, openAllFiles } from './OpenCommand';
import controllerCommand from './ControllerCommand';

export async function activate(context: vscode.ExtensionContext) {
	setDevMode(context.extensionMode);

	const hoverDispose = vscode.languages.registerHoverProvider(HoverProvider.documentFilter(), new HoverProvider());
	context.subscriptions.push(hoverDispose);

	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	const commandDispose = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto', Command);
	context.subscriptions.push(commandDispose);

	const newWindowDispose = vscode.commands.registerCommand(
		'extension.vscode-laravel-goto.new-window',
		(args) => newWindow(context, args as IOpenAllArgs)
	);
	context.subscriptions.push(newWindowDispose);
	await openAllFiles(context);

	const controllerDispose = vscode.commands.registerCommand(
		'extension.vscode-laravel-goto.controller',
		controllerCommand
	);
	context.subscriptions.push(controllerDispose);

	const router = new Router;
	await router.update();
	const watcher = router.watch();
	context.subscriptions.push(watcher);
}

