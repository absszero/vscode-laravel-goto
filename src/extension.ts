import * as vscode from 'vscode';
import { Namespace } from './namespace';

let editor: vscode.TextEditor;
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto',
	(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
		editor = textEditor;
		let selection = getSelection(editor.selection);
		let path = getPath(selection);
		search(path);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

/**
 * quick open by path
 * @param path
 */
function search(path: string) : void
{
	if (isController(path)) {
		path = path + '.php';
	} else {
		path = path.replace(/\./g, '/') + '.blade.php';
	}

	vscode.commands.executeCommand('workbench.action.quickOpen', path);
}

/**
 * get path by selection
 * @param selection
 */
function getPath(selection: vscode.Range) : string
{
	let path = editor.document.getText(selection);
	if (isController(path)) {
		let splited = path.split('@');
        path = splited[0];

		let namespace = (new Namespace).find(editor.document, selection);
		if (namespace) {
			path = namespace + '\\' + path;
		}
	} else {
		let splited = path.split(':');
        path = splited[splited.length - 1];
	}

	return path;
}

/**
 * check if a path is a controller path
 * @param path
 */
function isController(path: string) : boolean
{
	return (-1 !== path.indexOf('@') || -1 !== path.indexOf('Controller'));
}

/**
 * get selection from cursor or first selection
 * @param selected
 */
function getSelection(selected: vscode.Selection) : vscode.Range {
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
