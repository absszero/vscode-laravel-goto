import * as vscode from 'vscode';
import { Namespace } from './namespace';
import { basename } from 'path';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto',
	(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
		const selection = getSelection(editor, editor.selection);
		const place = getPlace(editor, selection);
		if (place.method) {
			const event = vscode.window.onDidChangeActiveTextEditor(e => {
				if (undefined !== e) {
					// if opened document is selected document, go to symbol
					if (basename(place.path) === basename(e.document.uri.path)) {
						vscode.commands.executeCommand('workbench.action.quickOpen', '@' + place.method);
					}
				}
				event.dispose();
			});
		}

		vscode.commands.executeCommand('workbench.action.quickOpen', place.path);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

/**
 * get place by selection
 * @param selection
 */
export function getPlace(editor: vscode.TextEditor, selection: vscode.Range) : { path: string; method: string; }
{
	let method = "";
	let path = editor.document.getText(selection);
	if (isController(path)) {
		if (-1 !== path.indexOf('@')) {
			let splited = path.split('@');
			path = splited[0];
			method = splited[1];
		}
		// it's not an absoulte path namespace
		if ('\\' !== path[0]) {
			let namespace = (new Namespace).find(editor.document, selection);
			if (namespace) {
				path = namespace + '/' + path;
			}
		}

		path = path.replace(/\\/g, '/') + '.php';

	} else {
		let splited = path.split(':');
		path = splited[splited.length - 1];
		path = path.replace(/\./g, '/') + '.blade.php';
	}
	return {path: path, method: method};
}

/**
 * check if a path is a controller path
 * @param path
 */
function isController(path: string) : boolean
{
	return (-1 !== path.indexOf('Controller'));
}

/**
 * get selection from cursor or first selection
 * @param selected
 */
export function getSelection(editor: vscode.TextEditor, selected: vscode.Selection) : vscode.Range {
	let start = selected.start;
	let end = selected.end;

	if (!start.isEqual(end)) {
		return new vscode.Range(start, end);
	}

	const line = editor.document.lineAt(start);
	const DELIMITERS = "\"'"
	while (start.isAfter(line.range.start)) {
		let next = start.with({character: start.character - 1})
		let char = editor.document.getText(new vscode.Range(next, start));
		if (-1 !== DELIMITERS.indexOf(char)) {
			break;
		}
		start = next;
	}
	while (end.isBefore(line.range.end)) {
		let next = end.with({character: end.character + 1})
		let char = editor.document.getText(new vscode.Range(end, next));
		if (-1 !== DELIMITERS.indexOf(char)) {
			break;
		}
		end = next;
	}

	return new vscode.Range(start, end);
}
