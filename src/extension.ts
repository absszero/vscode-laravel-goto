import * as vscode from 'vscode';
import { Namespace } from './namespace';
import { basename } from 'path';

let extensions : Array<string> = vscode.workspace.getConfiguration().get('laravelGoto.staticFileExtensions', []);
extensions = extensions.map(ext => ext.toLowerCase());

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto',
	(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
		const selection = getSelection(editor, editor.selection);
		const place = getPlace(editor, selection);
		if (place.location) {
			const event = vscode.window.onDidChangeActiveTextEditor(e => {
				event.dispose();
				if (undefined === e) {
					return;
				}
				if (basename(place.path) !== basename(e.document.uri.path)) {
					return;
				}

				// It's a controller method
				if ('@' === place.location[0]) {
					vscode.commands.executeCommand('workbench.action.quickOpen', place.location);
				} else {
					const range = locationRange(e.document, place.location);
					if (range) {
						e.selection = new vscode.Selection(range.start, range.end);
						e.revealRange(range);
					}
				}
			});
		}

		vscode.commands.executeCommand('workbench.action.quickOpen', place.path);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

/**
 * return the range of location
 * @param doc
 * @param location
 */
function locationRange(doc: vscode.TextDocument, location: string) : vscode.Range | undefined {
	const regx = new RegExp(location);
	const match = regx.exec(doc.getText());
	if (match) {
		return new vscode.Range(
			doc.positionAt(match.index),
			doc.positionAt(match.index + match[0].length),
		);
	}
}
/**
 * get place by selection
 * @param selection
 */
export function getPlace(editor: vscode.TextEditor, selection: vscode.Range) : { path: string; location: string; }
{
	let location = "";
	let path = editor.document.getText(selection);
	const line = editor.document.getText(editor.document.lineAt(selection.start).range);

	if (isController(path)) {
		if (-1 !== path.indexOf('@')) {
			let splited = path.split('@');
			path = splited[0];
			location = '@' + splited[1];
		}
		// it's not an absoulte path namespace
		if ('\\' !== path[0]) {
			let namespace = (new Namespace).find(editor.document, selection);
			if (namespace) {
				path = namespace + '/' + path;
			}
		}

		path = path.replace(/\\/g, '/') + '.php';

	} else if (isConfig(line, path)) {
		let splited = path.split('.');
		path = 'config/' + splited[0] + '.php'
		if (2 <= splited.length) {
			location = "(['\"]{1})" + splited[1] + "\\1\\s*=>";
		}

	} else if (isLanguage(line, path)) {
		// a package lang file
		if (-1 !== path.indexOf(':')) {
			let splited = path.split(':');
			path = splited[splited.length - 1] + '.php';
		} else {
			let splited = path.split('.');
			path = 'resources/lang/' + splited[0] + '.php'

			if (2 <= splited.length) {
				location = "(['\"]{1})" + splited[1] + "\\1\\s*=>";
			}
		}

	} else if (isEnv(line, path)) {
		location = path
		path = '.env'

	} else if (isStaticFile(path)) {
		let splited = path.split('/');
		splited = splited.filter(d => (d !== '..' && d !== '.') );
		path = splited.join('/');

	} else {
		let splited = path.split(':');
		path = splited[splited.length - 1];
		path = path.replace(/\./g, '/') + '.blade.php';
	}

	return {path: path, location: location};
}

/**
 * check if the path is a controller path
 * @param path
 */
function isController(path: string) : boolean
{
	return (-1 !== path.indexOf('Controller'));
}

/**
 * check if the path ends with an specified extenstion
 * @param path
 */
function isStaticFile(path: string) : boolean
{
	const splited = path.split('.');
	const ext = splited[splited.length - 1].toLocaleLowerCase();
	return (-1 !== extensions.indexOf(ext));
}

/**
 * check if the path is a config file
 * @param line
 * @param path
 */
function isConfig(line: string, path: string) : boolean
{
	const patterns = [
		/Config::[^'"]*(['"])([^'"]*)\1/,
		/config\([^'"]*(['"])([^'"]*)\1/
	];

	for (const pattern of patterns) {
		let match = pattern.exec(line);
		if (match && match[2] == path) {
			return true;
		}
	}

	return false;
}

/**
 * check if the path is a language file
 * @param line
 * @param path
 */
function isLanguage(line: string, path: string): boolean {
	const patterns = [
		/__\([^'"]*(['"])([^'"]*)\1/,
		/@lang\([^'"]*(['"])([^'"]*)\1/,
		/trans\([^'"]*(['"])([^'"]*)\1/,
		/trans_choice\([^'"]*(['"])([^'"]*)\1/,
	];

	for (const pattern of patterns) {
		let match = pattern.exec(line);
		if (match && match[2] == path) {
			return true;
		}
	}

	return false;
}


/**
 * check if the path is a .env file
 * @param line
 * @param path
 */
function isEnv(line: string, path: string) : boolean
{
	const pattern = /env\(\s*(['"])([^'"]*)\1/;
	const match = pattern.exec(line);
	return (Boolean)(match && match[2] === path);
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
