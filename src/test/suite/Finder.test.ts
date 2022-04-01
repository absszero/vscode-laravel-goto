import * as assert from 'assert';
import { before } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getSelection } from '../../Locator';
import { Finder } from '../../Finder';

import * as path from "path";

let editor : vscode.TextEditor;
suite('Extension Test Suite', () => {
	before(async () => {
		const document = await vscode.workspace.openTextDocument({language: 'php'});
		editor = await vscode.window.showTextDocument(document);
		vscode.window.showInformationMessage('Start all tests.');
	});

	test('Closing tag Component', async () => {
		replace("</x-al|ert>").then(() => {
			assertPath("alert.php");
		});
	});

	test('Component with namespace', async () => {
		replace("<x-namespace::|alert/>").then(() => {
			assertPath("namespace/alert.php");
		});
	});

	test('Component', async () => {
		replace("<x-form.|input/>").then(() => {
			assertPath("form/input.php");
		});
	});

	test('View file', async () => {
		replace("view('hello|_view');").then(() => {
			assertPath("hello_view.blade.php");
		});
	});

	test('View file with Namespace', async () => {
		replace("view('Namespace::hel|lo_view');").then(() => {
			assertPath("hello_view.blade.php");
		});
	});

	test('Controller', async () => {
		replace("Route::get('/', 'HelloControlle|r@index');").then(() => {
			assertPath("HelloController.php", "@index");
		});
	});

	test('Controller with Route::namespace', async () => {
		replace(`Route::namespace('58')->group(function () {
			Route::get('/', 'HelloControl|ler@index');
		});`).then(() => {
			assertPath("58/HelloController.php", "@index");
		});
	});

	test('Controller with Route::group()', async () => {
		replace(`Route::group(['namespace' => '52'], function () {
			Route::get('/', 'HelloContro|ller@index');
		});`).then(() => {
			assertPath("52/HelloController.php", "@index");
		});
	});

	test('Controller with Route::resource', async () => {
		replace(`Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'Hel|loController', ['only' => [
				'index', 'show'
			]]);
		});`).then(() => {
			assertPath("Resource/HelloController.php");
		});
	});

	test('Controller with $router->group()', async () => {
		replace(`$router->group(['namespace' => 'Lumen'], function () use ($router) {
			Route::get('/', 'HelloControl|ler@index');
		});`).then(() => {
			assertPath("Lumen/HelloController.php", "@index");
		});
	});

	test('Controller with absolute path namespace', async () => {
		replace(`Route::group(['namespace' => 'Abc'], function () {
			Route::get('/', '\Absolute\HelloContr|oller@index');
		});`).then(() => {
			assertPath("/Absolute/HelloController.php", "@index");
		});
	});

	test('Static file', async () => {
		replace(`'hell|o.JS';`).then(() => {
			assertPath("hello.JS");
		});
	});

	test('Facade config get', async () => {
		replace(`Config::get('app.t|imezone');`).then(() => {
			assertPath("config/app.php");
		});
	});

	test('Facade config set', async () => {
		replace(`Config::set(   'app.time|zone', 'UTC');`).then(() => {
			assertPath("config/app.php");
		});
	});

	test('config get only file', async () => {
		replace(`config('a|pp');`).then(() => {
			assertPath("config/app.php");
		});
	});

	test('config get', async () => {
		replace(`config('app.time|zone');`).then(() => {
			assertPath("config/app.php");
		});
	});

	test('config set', async () => {
		replace(`config(     ['app.time|zone' => 'UTC']);`).then(() => {
			assertPath("config/app.php");
		});
	});

	test('.env', async () => {
		replace(`env(   'APP_DEB|UG', false);`).then(() => {
			assertPath(".env");
		});
	});

	test('lang underscore', async () => {
		replace(`__('messages.|welcome');`).then(() => {
			assertPath("resources/lang/messages.php");
		});
	});

	test('@lang', async () => {
		replace(`@lang('messages|.welcome');`).then(() => {
			assertPath("resources/lang/messages.php");
		});
	});

	test('trans', async () => {
		replace(`trans('messages.w|elcome');`).then(() => {
			assertPath("resources/lang/messages.php");
		});
	});

	test('trans_choice', async () => {
		replace(`trans_choice('message|s.apples', 10);`).then(() => {
			assertPath("resources/lang/messages.php");
		});
	});

	test('package trans', async () => {
		replace(`trans('package::m|essages');`).then(() => {
			assertPath("resources/lang/vendor/package/messages.php");
		});
	});

	test('relative static file path', async () => {
		replace(`'./../../he|llo.JS';`).then(() => {
			assertPath("hello.JS");
		});
	});

	test('config in config', async () => {
		replace(`config(['app.timezone' => config('ap|p.tz')]);`).then(() => {
			assertPath("config/app.php");
		});
	});

	test('vendor view', async () => {
		replace(`view('vendor::he|llo_view');`).then(() => {
			assertPath("vendor/hello_view.blade.php");
		});
	});

	test('app_path', async () => {
		replace(`app_path('Use|r.php');`).then(() => {
			assertPath("app/User.php");
		});
	});

	test('config_path', async() => {
		replace(`config_path('a|pp.php');`).then(() => {
			assertPath('config/app.php');
		});
	});

	test('database_path', async() => {
		replace(`database_path('UserFa|ctory.php');`).then(() => {
			assertPath('database/UserFactory.php');
		});
	});

	test('public_path', async() => {
		replace(`public_path('css/ap|p.css');`).then(() => {
			assertPath('public/css/app.css');
		});
	});

	test('resource_path', async() => {
		replace(`resource_path('sass/a|pp.scss');`).then(() => {
			assertPath('resources/sass/app.scss');
		});
	});

	test('storage_path', async() => {
		replace(`storage_path('logs/lar|avel.log');`).then(() => {
			assertPath('storage/logs/laravel.log');
		});
	});

	test('path_helper_with_double_brackets', async () => {
		replace(`realpath(storage_path('logs/la|ravel.log'));`).then(() => {
			assertPath('storage/logs/laravel.log');
		});
	});

	test('Laravel 8 controller with namespace', async () => {
		replace(`Route::get('/', [L8\HelloControl|ler::class, 'index']);`).then(() => {
			assertPath("L8/HelloController.php", "@index");
		});
	});

	test('Laravel 8 controller without action', async () => {
		replace(`Route::get('/', HelloCo|ntroller::class);`).then(() => {
			assertPath("HelloController.php");
		});
	});

	test('Laravel 8 controller with group namespace', async () => {
		replace(`Route::group(['namespace' => 'L8'], function () {
			Route::get('/', [\HelloContro|ller::class, 'index']);
		});`).then(() => {
			assertPath("L8/HelloController.php");
		});
	});
});

function replace(text: string) : Thenable<boolean> {
	return editor.edit((textEditorEdit) => {
		const firstLine = editor.document.lineAt(0);
		const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
		const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

		text = '<?php ' + text;
		const cursor = text.indexOf('|');
		if (-1 !== cursor) {
			text.replace('|', '');
		}
		textEditorEdit.replace(textRange, text);

		if (-1 !== cursor) {
			const position = editor.document.positionAt(cursor);
			editor.selection = new vscode.Selection(position, position);
		}
	});
}

function assertPath(expected: string, location?: string) {
	const selection = getSelection(editor.document, editor.selection, "\"'[,)");
	if (!selection) {
		assert.fail();
	}
	const finder = new Finder(editor.document, selection);
	const place = finder.getPlace();
	assert.strictEqual(place.path, expected);
	if (location) {
		assert.strictEqual(place.location, location);
	}
}

