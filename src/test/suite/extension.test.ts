import * as assert from 'assert';
import { before } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getSelection, getPlace } from '../../extension';

import * as path from "path";

let editor : vscode.TextEditor;
suite('Extension Test Suite', () => {
	before(async () => {
		const folder = process.env.EXTENSION_PATH || process.env.INIT_CWD;
		let file = path.resolve(folder + '/src/test/route.php');
		const document = await vscode.workspace.openTextDocument(file);
		editor = await vscode.window.showTextDocument(document);
		vscode.window.showInformationMessage('Start all tests.');
	});

	test('View file', async () => {
		assertPath(18, "hello_view.blade.php");
	});

	test('View file with Namespace', async () => {
		assertPath(47, "hello_view.blade.php");
	});

	test('Controller', async () => {
		assertPath(86, "HelloController.php", "index");
	});

	test('Controller with Route::namespace', async () => {
		assertPath(180, "58/HelloController.php", "index");
	});

	test('Controller with Route::group()', async () => {
		assertPath(285, "52/HelloController.php", "index");
	});

	test('Controller with Route::resource', async () => {
		assertPath(390, "Resource/HelloController.php");
	});

	test('Controller with $router->group()', async () => {
		assertPath(550, "Lumen/HelloController.php", "index");
	});

	test('Controller with absoulte path namespace', async () => {
		assertPath(660, "/Absolute/HelloController.php", "index");
	});

});

function assertPath(position: number, expected: string, method?: string) {
	editor.selection = new vscode.Selection(editor.document.positionAt(position), editor.document.positionAt(position));
	const selection = getSelection(editor, editor.selection);
	const place = getPlace(editor, selection);
	assert.equal(place.path, expected)
	if (method) {
		assert.equal(place.method, method)
	}
}
