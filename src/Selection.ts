import * as vscode from 'vscode';

export class Selection extends vscode.Range {
	/**
	 * get selection from cursor or first selection
	 * @param document
	 * @param selected
	 * @param delimiters
	 * @returns
	 */
	public static getByDelimiter(document: vscode.TextDocument, selected: vscode.Range, delimiters = `<("'[,)>`): Selection | undefined {
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

		const selection = new Selection(start, end);
		if (selection.isEqual(line.range)) {
			return undefined;
		}

		return selection;
	}

	/**
	 * get lines after delimiter
	 * @param document
	 * @param delimiter
	 * @returns
	 */
	public getLinesAfterDelimiter(document: vscode.TextDocument, delimiter = '(') : string {
		const lines: string[] = [];
		let lineNumber = this.start.line;
		while(lineNumber >= 0) {
			const text = document.lineAt(lineNumber).text.trim();
			lines.unshift(text);
			if (text.includes(delimiter) && !text.startsWith('->')) {
				return lines.join('');
			}
			lineNumber--;
		}

		return '';
	}

	/**
	 * get path
	 * @param document
	 * @returns
	 */
	public getPath(document: vscode.TextDocument) : string {
		let path = document.getText(this).trim();
		path = path.replace(/^[\s{<!-]+|[-\s>}]+$/g, '');
		path = path.replace(/{.*/, ''); // remove the rest of string after {
		path = path.replace(/\$.*/, ''); // remove the rest of string after $
		path = path.replace(/\.$/, ''); // remove dot at the end

		return path;
	}
}
