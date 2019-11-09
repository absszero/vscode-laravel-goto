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
		let file = path.resolve(folder + '/src/test/sample.php');
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
		assertPath(86, "HelloController.php", "@index");
	});

	test('Controller with Route::namespace', async () => {
		assertPath(180, "58/HelloController.php", "@index");
	});

	test('Controller with Route::group()', async () => {
		assertPath(285, "52/HelloController.php", "@index");
	});

	test('Controller with Route::resource', async () => {
		assertPath(390, "Resource/HelloController.php");
	});

	test('Controller with $router->group()', async () => {
		assertPath(550, "Lumen/HelloController.php", "@index");
	});

	test('Controller with absoulte path namespace', async () => {
		assertPath(660, "/Absolute/HelloController.php", "@index");
	});

	test('Static file', async () => {
		assertPath(690, "hello.JS");
	});

	test('Facade config get', async () => {
		assertPath(715, "config/app.php");
	});

	test('Facade config set', async () => {
		assertPath(750, "config/app.php");
	});

	test('config get only file', async () => {
		assertPath(777, "config/app.php");
	});

	test('config get', async () => {
		assertPath(800, "config/app.php");
	});

	test('config set', async () => {
		assertPath(830, "config/app.php");
	});

	test('.env', async () => {
		assertPath(865, ".env");
	});

	test('lang underscore', async () => {
		assertPath(890, "resources/lang/messages.php");
	});

	test('@lang', async () => {
		assertPath(920, "resources/lang/messages.php");
	});

	test('trans', async () => {
		assertPath(950, "resources/lang/messages.php");
	});

	test('trans_choice', async () => {
		assertPath(980, "resources/lang/messages.php");
	});

	test('package trans', async () => {
		assertPath(1015, "messages.php");
	});

	test('relative static file path', async () => {
		assertPath(1040, "hello.JS");
	});

	test('config in config', async () => {
		assertPath(1085, "config/app.php");
	});

});

function assertPath(position: number, expected: string, location?: string) {
	editor.selection = new vscode.Selection(editor.document.positionAt(position), editor.document.positionAt(position));
	const selection = getSelection(editor, editor.selection);
	const place = getPlace(editor, selection);
	assert.equal(place.path, expected)
	if (location) {
		assert.equal(place.location, location)
	}
}

