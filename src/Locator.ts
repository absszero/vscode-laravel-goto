import { basename } from 'path';
import * as vscode from 'vscode';
import { Finder } from './Finder';
import { Place } from './Place';
import { findFiles } from './Workspace';

let event: vscode.Disposable | null;

/**
 * locate files
 *
 * @var {[type]}
 */
export async function locate(document: vscode.TextDocument, range: vscode.Range): Promise<Place | undefined> {
	const selection = getSelection(document, range, `<("'[,)>`);
	if (!selection) {
		return undefined;
	}
	const finder = new Finder(document, selection);
	const place = await finder.getPlace();

	if (place.paths?.size) {
		for (const [path, uris] of place.paths) {
			if (uris.length !== 0) {
				continue;
			}
			place.paths.set(path, await findFiles('**/' + path));
		}
		return place;
	}

	if (place.path) {
		place.uris = await findFiles('**/' + place.path);
		return place;
	}
}

/**
 * get selection from cursor or first selection
 * @param selected
 */
export function getSelection(document: vscode.TextDocument, selected: vscode.Range, delimiters: string): vscode.Range | undefined {
	let start = selected.start;
	let end = selected.end;

	const line = document.lineAt(start);
	while (start.isAfter(line.range.start)) {
		const next = start.with({ character: start.character - 1 });
		const char = document.getText(new vscode.Range(next, start));
		if (-1 !== delimiters.indexOf(char)) {
			break;
		}
		start = next;
	}
	while (end.isBefore(line.range.end)) {
		const next = end.with({ character: end.character + 1 });
		const char = document.getText(new vscode.Range(end, next));
		if (-1 !== delimiters.indexOf(char)) {
			break;
		}
		end = next;
	}

	const range = new vscode.Range(start, end);
	if (range.isEqual(line.range)) {
		return undefined;
	}

	return range;
}

/**
 * get lines after delimiter
 * @param document
 * @param lineNumber
 * @param delimiter
 * @returns
 */
export function getLinesAfterDelimiter(document: vscode.TextDocument, lineNumber: number, delimiter = '(') : string {
	const lines: string[] = [];
	while(lineNumber >= 0) {
		const text = document.lineAt(lineNumber).text.trim();
		lines.unshift(text);
		if (text.includes(delimiter)) {
			return lines.join('');
		}
		lineNumber--;
	}

	return '';
}

/**
 * fire a goto-symbol event after a file is opened
 *
 * @param   {Place}  place  [place description]
 *
 * @return  {void}
 */
export function fireGotoSymbolEvent(place: Place): void {
	if (!place.location) {
		return;
	}

	// dispose previous event
	if (event) {
		event.dispose();
		event = null;
	}
	event = vscode.window.onDidChangeActiveTextEditor(async e => {
		if (null === event) {
			return;
		}

		if (undefined === e) {
			return;
		}

		const activePath = basename(e.document.uri.path);
		if (basename(place.path) !== activePath) {
			if (!place.paths) {
				event.dispose();
				return;
			}

			const paths = Array.from(place.paths.keys());
			if (paths.every((path: string) => basename(path) !== activePath)) {
				event.dispose();
				return;
			}
		}



		event.dispose();
		// It's a controller method
		if ('@' === place.location[0]) {
			await vscode.commands.executeCommand('workbench.action.quickOpen', place.location);
		} else {
			let location = place.location;
			if (place.locations?.has(activePath)) {
				location = place.locations?.get(activePath) ?? '';
			}
			locateByLocation(e, location);
		}
	});
}

/**
 * return the range of location
 * @param editor
 * @param location
 */
export function locateByLocation(editor: vscode.TextEditor, location: string) : void {
	if (!location) {
		return;
	}

	const regex = new RegExp(location);
	const match = regex.exec(editor.document.getText());
	if (match) {
		const range = new vscode.Range(
			editor.document.positionAt(match.index),
			editor.document.positionAt(match.index + match[0].length),
		);

		editor.selection = new vscode.Selection(range.start, range.end);
		editor.revealRange(range);
	}
}
