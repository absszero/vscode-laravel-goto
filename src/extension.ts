import * as vscode from 'vscode';
import { Namespace } from './namespace';
import { basename } from 'path';

let extensions : Array<string> = vscode.workspace.getConfiguration().get('laravelGoto.staticFileExtensions', []);
extensions = extensions.map(ext => ext.toLowerCase());

class Place {
	path: string;
	location: string;

	constructor() {
		this.path = "";
		this.location = "";
	}
}
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

	let places = [
		controllerPlace,
		configPlace,
		langPlace,
		envPlace,
		staticPlace,
	];

	for (let i = 0; i < places.length; i++) {
		let place = places[i](editor, selection, path, line);
		if (place.path) {
			return place;
		}
	}

	let place = viewPlace(editor, selection, path, line);
	return place;
}

function controllerPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	let place = new Place;
	if (-1 === path.indexOf('Controller')) {
		return place;
	}

	if (-1 !== path.indexOf('@')) {
		let split = path.split('@');
		path = split[0];
		place.location = '@' + split[1];
	}
	// it's not an absolute path namespace
	if ('\\' !== path[0]) {
		let namespace = (new Namespace).find(editor.document, selection);
		if (namespace) {
			path = namespace + '/' + path;
		}
	}

	place.path = path.replace(/\\/g, '/') + '.php';
	return place;
}

function configPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	const patterns = [
		/Config::[^'"]*(['"])([^'"]*)\1/,
		/config\([^'"]*(['"])([^'"]*)\1/g
	];

	let place = new Place;

	for (const pattern of patterns) {
		let match;
		do {
			match = pattern.exec(line);
			if (match && match[2] == path) {
				let split = path.split('.');
				place.path = 'config/' + split[0] + '.php';
				if (2 <= split.length) {
					place.location = "(['\"]{1})" + split[1] + "\\1\\s*=>";
				}
				return place;
			}
		} while (match)
	}

	return place;
}

function langPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	const patterns = [
		/__\([^'"]*(['"])([^'"]*)\1/,
		/@lang\([^'"]*(['"])([^'"]*)\1/,
		/trans\([^'"]*(['"])([^'"]*)\1/,
		/trans_choice\([^'"]*(['"])([^'"]*)\1/,
	];

	let place = new Place;

	for (const pattern of patterns) {
		let match = pattern.exec(line);
		if (match && match[2] == path) {
			let split = path.split(':');
			let vendor = (3 == split.length) ? `/vendor/${split[0]}` : '';
			let keys = split[split.length - 1].split('.');

			place.path = `resources/lang${vendor}/${keys[0]}.php`;
			if (2 <= keys.length) {
				place.location = "(['\"]{1})" + keys[1] + "\\1\\s*=>";
			}

			return place;
		}
	}

	return place;
}

function envPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	const pattern = /env\(\s*(['"])([^'"]*)\1/;
	const match = pattern.exec(line);
	let place = new Place;

	if ((Boolean)(match && match[2] === path)) {
		place.location = path
		place.path = '.env'
		return place;
	}

	return place;
}

function staticPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	const split = path.split('.');
	const ext = split[split.length - 1].toLocaleLowerCase();
	let place = new Place;
	if (-1 !== extensions.indexOf(ext)) {
		let split = path.split('/');
		split = split.filter(d => (d !== '..' && d !== '.'));
		place.path = split.join('/');
		return place;
	}
	return place;
}

function viewPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	let split = path.split(':');
	let vendor = '';
	// namespace or vendor
	if (3 == split.length) {
		// it's vendor
		if (split[0] == split[0].toLowerCase()) {
			vendor = split[0] + '/';
		}
	}

	let place = new Place;
	place.path = split[split.length - 1];
	place.path = vendor + place.path.replace(/\./g, '/') + '.blade.php';

	return place;
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
