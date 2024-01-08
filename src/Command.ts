import * as vscode from 'vscode';
import { locate, fireGotoSymbolEvent } from './Locator';
import { IOpenAllArgs } from './IOpenAllArgs';

export default (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
	locate(editor.document, editor.selection)
	.then(async place => {
		if (undefined === place) {
			vscode.window.showWarningMessage('Laravel Goto: unidentified string.');
			return;
		}

		fireGotoSymbolEvent(place);

		let uris = place.uris;
		let path = place.path;
		if (place.paths?.size) {
			const items = Array.from(place.paths.keys());
			const fsPaths = place.getUniquePaths();
			const openAll = 'Open all files above in new window';
			if (fsPaths.length) {
				items.push('');
				items.push(openAll);
			}

			path = await vscode.window.showQuickPick(items) || '';
			if (openAll === path) {
				const arg = {location: place.location, files: fsPaths} as IOpenAllArgs;
				vscode.commands.executeCommand('extension.vscode-laravel-goto.new-window', arg);
				return;
			}

			uris = place.paths.get(path) || [];
		}

		if (!path) {
			return;
		}

		if (1 === uris.length) {
			vscode.commands.executeCommand('vscode.open', vscode.Uri.file(uris[0].fsPath));
			return;
		}

		vscode.commands.executeCommand('workbench.action.quickOpen', path);
	});
};