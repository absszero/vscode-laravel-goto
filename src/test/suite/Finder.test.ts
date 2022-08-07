import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';
import { getSelection } from '../../Locator';
import { Finder } from '../../Finder';
import { replace } from './Utils';

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

	test('namespace file', async() => {
		await replace(editor, '"App\\Use|r"');
		assertPath("App\\User.php");
	});

	test('closing tag Component', async() => {
		await replace(editor, "</x-al|ert>");
		assertPath("alert.php");
	});

	test('component with namespace', async() => {
		await replace(editor, "<x-namespace::|alert/>");
		assertPath("namespace/alert.php");
	});

	test('component', async() => {
		await replace(editor, "<x-form.|input/>");
		assertPath("form/input.php");
	});

	test('view file', async() => {
		await replace(editor, "view('hello|_view');");
		assertPath("hello_view.blade.php");
	});

	test('view file with Namespace', async() => {
		await replace(editor, "view('Namespace::hel|lo_view');");
		assertPath("hello_view.blade.php");
	});

	test('controller', async () => {
		await await replace(editor, "Route::get('/', 'HelloControlle|r@index');");
		assertPath("HelloController.php", "@index");
	});

	test('controller with Route::namespace', async() => {
		await replace(editor, `Route::namespace('58')->group(function () {
			Route::get('/', 'HelloControl|ler@index');
		});`);
		assertPath("58/HelloController.php", "@index");
	});

	test('controller with Route::group()', async() => {
		await replace(editor, `Route::group(['namespace' => '52'], function () {
			Route::get('/', 'HelloContro|ller@index');
		});`);
		assertPath("52/HelloController.php", "@index");
	});

	test('controller with Route::resource', async() => {
		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'HelloCo|ntroller', ['only' => [
				'index', 'show'
			]]);
		});`);
		assertPath("Resource/HelloController.php");
	});

	test('controller action with Route::resource', async() => {
		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'HelloController', ['only' => [
				'index', 'sho|w'
			]]);
		});`);
		assertPath("Resource/HelloController.php", '@show');
	});

	test('controller with $router->group()', async() => {
		await replace(editor, `$router->group(['namespace' => 'Lumen'], function () use ($router) {
			Route::get('/', 'HelloControl|ler@index');
		});`);
		assertPath("Lumen/HelloController.php", "@index");
	});

	test('controller with absolute path namespace', async() => {
		await replace(editor, `Route::group(['namespace' => 'Abc'], function () {
			Route::get('/', '\\Absolute\\HelloContr|oller@index');
		});`);
		assertPath("/Absolute/HelloController.php", "@index");
	});

	test('static file', async() => {
		await replace(editor, `'hell|o.JS';`);
		assertPath("hello.JS");
	});

	test('facade config get', async() => {
		await replace(editor, `Config::get('app.t|imezone');`);
		assertPath("config/app.php");
	});

	test('facade config set', async() => {
		await replace(editor, `Config::set(   'app.time|zone', 'UTC');`);
		assertPath("config/app.php");
	});

	test('config get only file', async() => {
		await replace(editor, `config('a|pp');`);
		assertPath("config/app.php");
	});

	test('config get', async() => {
		await replace(editor, `config('app.time|zone');`);
		assertPath("config/app.php");
	});

	test('config set', async() => {
		await replace(editor, `config(     ['app.time|zone' => 'UTC']);`);
		assertPath("config/app.php");
	});

	test('.env', async() => {
		await replace(editor, `env(   'APP_DEB|UG', false);`);
		assertPath(".env");
	});

	test('lang underscore', async() => {
		await replace(editor, `__('messages.|welcome');`);
		assertPath("lang/messages.php");
	});

	test('@lang', async() => {
		await replace(editor, `@lang('messages|.welcome');`);
		assertPath("lang/messages.php");
	});

	test('trans', async() => {
		await replace(editor, `trans('messages.w|elcome');`);
		assertPath("lang/messages.php");
	});

	test('trans_choice', async() => {
		await replace(editor, `trans_choice('message|s.apples', 10);`);
		assertPath("lang/messages.php");
	});

	test('package trans', async() => {
		await replace(editor, `trans('package::m|essages');`);
		assertPath("lang/vendor/package/messages.php");
	});

	test('relative static file path', async() => {
		await replace(editor, `'./../../he|llo.JS';`);
		assertPath("hello.JS");
	});

	test('config in config', async() => {
		await replace(editor, `config(['app.timezone' => config('ap|p.tz')]);`);
		assertPath("config/app.php");
	});

	test('vendor view', async() => {
		await replace(editor, `view('vendor::he|llo_view');`);
		assertPath("vendor/hello_view.blade.php");
	});

	test('app_path', async() => {
		await replace(editor, `app_path('Use|r.php');`);
		assertPath("app/User.php");
	});

	test('config_path', async() => {
		await replace(editor, `config_path('a|pp.php');`);
		assertPath('config/app.php');
	});

	test('database_path', async() => {
		await replace(editor, `database_path('UserFa|ctory.php');`);
		assertPath('database/UserFactory.php');
	});

	test('public_path', async() => {
		await replace(editor, `public_path('css/ap|p.css');`);
		assertPath('public/css/app.css');
	});

	test('resource_path', async() => {
		await replace(editor, `resource_path('sass/a|pp.scss');`);
		assertPath('resources/sass/app.scss');
	});

	test('storage_path', async() => {
		await replace(editor, `storage_path('logs/lar|avel.log');`);
			assertPath('storage/logs/laravel.log');
	});

	test('path_helper_with_double_brackets', async() => {
		await replace(editor, `realpath(storage_path('logs/la|ravel.log'));`);
		assertPath('storage/logs/laravel.log');
	});

	test('laravel 8 controller with namespace', async() => {
		await replace(editor, `Route::get('/', [L8\\HelloControl|ler::class, 'index']);`);
		assertPath("L8/HelloController.php", "@index");
	});

	test('laravel 8 controller without action', async() => {
		await replace(editor, `Route::get('/', HelloCo|ntroller::class);`);
		assertPath("HelloController.php");
	});

	test('laravel 8 controller with group namespace', async() => {
		await replace(editor, `Route::group(['namespace' => 'L8'], function () {
			Route::get('/', [\\HelloContro|ller::class, 'index']);
		});`);
		assertPath("L8/HelloController.php");
	});
});

function assertPath(expected: string, location?: string) {
	const selection = getSelection(editor.document, editor.selection, "<\"'[,)>");
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

