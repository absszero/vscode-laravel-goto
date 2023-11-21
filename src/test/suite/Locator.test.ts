import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';
import { replace } from './Utils';
import * as Locator from '../../Locator';

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
		const selection = Locator.getSelection(editor.document, editor.selection, "-");
		const text = editor.document.getText(selection).trim();
		assert.strictEqual(text, 'HelloWorld');
	});

	test('getLinesAfterDelimiter', async () => {
		await replace(editor, `
view(
	'hello|_view',
	['name' => 'James']
);`);

		const lines = Locator.getLinesAfterDelimiter(editor.document, 2);
		assert.strictEqual(lines, `view('hello_view',`);
	});

	test('locateByLocation', async () => {
		await replace(editor, `return [
			'hello' => 'Hello',
		];`);

		// not matched
		Locator.locateByLocation(editor, "(['\"]{1})" + 'Hi' + "\\1\\s*=>");
		let text = editor.document.getText(editor.selection).trim();
		assert.strictEqual(text, '');

		// matched
		Locator.locateByLocation(editor, "(['\"]{1})" + 'hello' + "\\1\\s*=>");
		text = editor.document.getText(editor.selection).trim();
		assert.strictEqual(text, `'hello' =>`);
	});
});
