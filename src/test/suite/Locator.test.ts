import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';
import { replace } from './Utils';
import { getSelection } from '../../Locator';

let editor : vscode.TextEditor;
suite('Locator Test Suite', () => {
	before(async () => {
        const document = await vscode.workspace.openTextDocument({language: 'php'});
		editor = await vscode.window.showTextDocument(document);
	});

	after(async () => {
		return await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	test('getSelection', async () => {
		await replace(editor, `--Hello|World--`);
		const selection = getSelection(editor.document, editor.selection, "-");
		const text = editor.document.getText(selection).trim();
		assert.strictEqual(text, 'HelloWorld');
	});
});