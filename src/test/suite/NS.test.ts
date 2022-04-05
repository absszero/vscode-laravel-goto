import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';
import { replace } from './Utils';
import { Namespace } from '../../NS';

let editor : vscode.TextEditor;
suite('Extension Test Suite', () => {
	before(async () => {
		const document = await vscode.workspace.openTextDocument({language: 'php'});
		editor = await vscode.window.showTextDocument(document);
		vscode.window.showInformationMessage('Start all tests.');
	});

	after(async () => {
		return await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	test('group_namespace', async () => {
		await replace(editor, `Route::group(['namespace' => '52'], function () {
			Route::get('/', 'HelloController@i|ndex');
		});`);
		let namespace = (new Namespace(editor.document)).find(editor.selection);
		assert.strictEqual(namespace, '52');
	});
});
