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
	const selection = getSelection(document, range, "<(\"'[,)>");
	if (!selection) {
		return undefined;
	}
	const finder = new Finder(document, selection);
	const place = await finder.getPlace();

	if (place.paths?.size) {
		for (const path of place.paths.keys()) {
			if (place.paths.get(path)?.length === 0) {
				place.paths.set(path, await findFiles('**/' + path));
			}
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
		let next = start.with({ character: start.character - 1 });
		let char = document.getText(new vscode.Range(next, start));
		if (-1 !== delimiters.indexOf(char)) {
			break;
		}
		start = next;
	}
	while (end.isBefore(line.range.end)) {
		let next = end.with({ character: end.character + 1 });
		let char = document.getText(new vscode.Range(end, next));
		if (-1 !== delimiters.indexOf(char)) {
			break;
		}
		end = next;
	}

	let range = new vscode.Range(start, end);
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
	let lines: string[] = [];
	while(lineNumber >= 0) {
		let text = document.lineAt(lineNumber).text.trim();
		lines.unshift(text);
		if (text.includes(delimiter)) {
			return lines.join('');
		}
		lineNumber--;
	}

	return '';
}

/**
 * go to the symbol in place after file is opened
 *
 * @param   {Place}  place  [place description]
 *
 * @return  {void}
 */
export function moveToSymbol(place: Place): void {
	if (!place.location) {
		return;
	}

	// dispose previous event
	if (event) {
		event.dispose();
		event = null;
	}
	event = vscode.window.onDidChangeActiveTextEditor(e => {
		if (null === event) {
			return;
		}

		if (undefined === e) {
			return;
		}
		if (basename(place.path) !== basename(e.document.uri.path)) {
			event.dispose();
			return;
		}
		event.dispose();
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

/**
 * return the range of location
 * @param doc
 * @param location
 */
export function locationRange(doc: vscode.TextDocument, location: string) : vscode.Range | undefined {
	const regx = new RegExp(location);
	const match = regx.exec(doc.getText());
	if (match) {
		return new vscode.Range(
			doc.positionAt(match.index),
			doc.positionAt(match.index + match[0].length),
		);
	}
}
