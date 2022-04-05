import * as vscode from 'vscode';

export async function replace(editor :vscode.TextEditor, text: string) : Promise<void> {
	let cursor : number = 0;
	return editor.edit((textEditorEdit) => {
		const firstLine = editor.document.lineAt(0);
		const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
		const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

		text = '<?php ' + text;
		cursor = text.indexOf('|');
		if (-1 !== cursor) {
			text = text.replace('|', '');
		}
		textEditorEdit.replace(textRange, text);
	}).then(() => {
		const position = editor.document.positionAt(cursor);
		editor.selection = new vscode.Selection(position, position);
	});
}