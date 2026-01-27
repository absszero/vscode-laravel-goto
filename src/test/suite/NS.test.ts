import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';
import { replace } from './Utils';
import { Namespace } from '../../NS';

let editor : vscode.TextEditor;
suite('NS Test Suite', () => {
	before(async () => {
		const document = await vscode.workspace.openTextDocument({language: 'php'});
		editor = await vscode.window.showTextDocument(document);
	});

	after(async () => {
		return await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	test('sibling_namespace', async () => {
		await replace(editor, `Route::namespace('58')->group(function () {
			Route::get('/', 'HelloController@index');
		});

		Route::group(['namespace' => '52'], function () {
			Route::get('/', 'HelloContro|ller@index');
		});`);
		const blocks = (new Namespace(editor.document)).blocks(editor.selection);
		assert.strictEqual(blocks.length, 1);
		assert.strictEqual(blocks[0].namespace, '52');
	});

	test('group_namespace', async () => {
		await replace(editor, `Route::group(['namespace' => '52'], function () {
			Route::get('/', 'HelloController@i|ndex');
		});`);
		const blocks = (new Namespace(editor.document)).blocks(editor.selection);
		assert.strictEqual(blocks[0].namespace, '52');
	});

	test('route::namespace', async () => {
		await replace(editor, `Route::namespace('58')->group(function () {
			Route::get('/', 'HelloControll|er@index');
		});`);
		const blocks = (new Namespace(editor.document)).blocks(editor.selection);
		assert.strictEqual(blocks[0].namespace, '58');
	});

	test('route::class_controller', async () => {
		await replace(editor, `Route::controller(HelloController::class)->group(function () {
			Route::get('/post|s/{id}', 'show');
			Route::post('/posts', 'store');
		});`);
		const blocks = (new Namespace(editor.document)).blocks(editor.selection);
		assert.strictEqual(blocks[0].namespace, 'HelloController');
	});

	test('route::string_controller', async () => {
		await replace(editor, `Route::controller('HelloController')->group(function () {
			Route::get('/post|s/{id}', 'show');
			Route::post('/posts', 'store');
		});`);
		const blocks = (new Namespace(editor.document)).blocks(editor.selection);
		assert.strictEqual(blocks[0].namespace, 'HelloController');
	});

	test('route::resource', async () => {
		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'HelloController', ['only' => [
				'ind|ex', 'show'
			]]);
		});`);
		let blocks = (new Namespace(editor.document)).blocks(editor.selection);
		assert.strictEqual(blocks[1].namespace, 'Resource');

		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::softDeletableResources('photo', 'HelloController', ['only' => [
				'ind|ex', 'show'
			]]);
		});`);
		blocks = (new Namespace(editor.document)).blocks(editor.selection);
		assert.strictEqual(blocks[1].namespace, 'Resource');
	});

	test('route::singleton, route:apiSingleton', async () => {
		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'HelloController', ['only' => [
				'ind|ex', 'show'
			]]);
		});`);
		let blocks = (new Namespace(editor.document)).blocks(editor.selection);
		assert.strictEqual(blocks[1].namespace, 'Resource');
	});

	test('middlewareFor', async () => {
		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'HelloController', ['only' => [
				'ind|ex', 'show'
			]]);
		});`);
		let blocks = (new Namespace(editor.document)).blocks(editor.selection);
		assert.strictEqual(blocks[1].namespace, 'Resource');
	});
});