import * as vscode from 'vscode';
import { locate, moveToSymbol } from './Locator';

export default (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
	locate(editor.document, editor.selection)
	.then(async place => {
		if (undefined === place) {
			vscode.window.showWarningMessage('Laravel Goto: unidentified string.');
			return;
		}

		moveToSymbol(place);

		let uris = place.uris;
		let path = place.path;
		if (place.paths?.size) {
			const items = Array.from(place.paths.keys());
			path = await vscode.window.showQuickPick(items) || '';
			uris = place.paths.get(path) || [];
		}

		if (!path) {
			return;
		}

		if (1 === uris.length) {
			vscode.commands.executeCommand('vscode.open', vscode.Uri.file(uris[0].path));
			return;
		}

		vscode.commands.executeCommand('workbench.action.quickOpen', path);
	});
};