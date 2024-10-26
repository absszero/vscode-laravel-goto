import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';
import { replace } from './Utils';
import { Selection } from '../../Selection';

let editor : vscode.TextEditor;
suite('Selection Test Suite', () => {
	before(async () => {
		const document = await vscode.workspace.openTextDocument({language: 'php'});
		editor = await vscode.window.showTextDocument(document);
	});

	after(async () => {
		return await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	test('getByDelimiter', async () => {
		await replace(editor, `--Hello|World--`);
		const selection = Selection.getByDelimiter(editor.document, editor.selection, "-");
		const text = editor.document.getText(selection).trim();
		assert.strictEqual(text, 'HelloWorld');
	});

	test('getLinesAfterDelimiter', async () => {
		await replace(editor, `
view(
	'hello_view',
	['name' => 'James']
);`);

		const selection = new Selection(new vscode.Position(2, 0), new vscode.Position(2, 0));
		const lines = selection.getLinesAfterDelimiter(editor.document);
		assert.strictEqual(lines, `view('hello_view',`);
	});

	test('getLinesAfterDelimiterWithArrow', async () => {
		await replace(editor, `
view('dashboard', ['users' => $users])
	->fragments(
		['user-list', 'comment-list']
);`);

		const selection = new Selection(new vscode.Position(3, 0), new vscode.Position(3, 0));
		const lines = selection.getLinesAfterDelimiter(editor.document);
		assert.strictEqual(lines, `view('dashboard', ['users' => $users])->fragments(['user-list', 'comment-list']`);
	});

	test('getPath', async () => {
		await replace(editor, `'ap|p.{$var}.timezone'`);
		let selection = Selection.getByDelimiter(editor.document, editor.selection);
		let path = selection?.getPath(editor.document);
		assert.strictEqual(path, 'app');

		await replace(editor, `"ap|p.$var.timezone"`);
		selection = Selection.getByDelimiter(editor.document, editor.selection);
		path = selection?.getPath(editor.document);
		assert.strictEqual(path, 'app');
	});
});
