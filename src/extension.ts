import * as vscode from 'vscode';
import { basename } from 'path';
import { getPlace } from './Place';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto',
	(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
		const selection = getSelection(editor, editor.selection, "\"'[,)");
		if (!selection) {
			return;
		}
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
 * get selection from cursor or first selection
 * @param selected
 */
export function getSelection(editor: vscode.TextEditor, selected: vscode.Range, delimiters: string) : vscode.Range | null {
	let start = selected.start;
	let end = selected.end;

	const line = editor.document.lineAt(start);
	while (start.isAfter(line.range.start)) {
		let next = start.with({character: start.character - 1});
		let char = editor.document.getText(new vscode.Range(next, start));
		if (-1 !== delimiters.indexOf(char)) {
			break;
		}
		start = next;
	}
	while (end.isBefore(line.range.end)) {
		let next = end.with({character: end.character + 1});
		let char = editor.document.getText(new vscode.Range(end, next));
		if (-1 !== delimiters.indexOf(char)) {
			break;
		}
		end = next;
	}

	let range = new vscode.Range(start, end);
	if (range.isEqual(line.range)) {
		return null;
	}

	return range;
}
