import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';
import { getSelection } from '../../Locator';
import { Finder } from '../../Finder';
import { replace } from './Utils';
import * as workspace from '../../Workspace';
import {promises as fsp} from "fs";

let editor : vscode.TextEditor;
const getFileContent = workspace.getFileContent;

suite('Finder Test Suite', () => {
	before(async () => {
		const document = await vscode.workspace.openTextDocument({language: 'php'});
		editor = await vscode.window.showTextDocument(document);
	});

	after(async () => {
		return await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	teardown(() => {
		(workspace as any).getFileContent = getFileContent;
	});

	test('Livewire tag', async() => {
		await replace(editor, '<livewire:nav.sho|w-post>');
		await assertPath("Nav/ShowPost.php");
	});

	test('Livewire blade directive', async() => {
		await replace(editor, '@livewire("nav.show|-post")');
		await assertPath("Nav/ShowPost.php");
	});

	test('Livewire method', async() => {
		await replace(editor, "layout('lay|outs.app')");
		await assertPath("layouts/app.blade.php");
	});

	test('inertia.js function', async() => {
		await replace(editor, 'inertia("About/AboutCo|mponent");');
		await assertPath("About/AboutComponent");
	});

	test('inertia.js render', async() => {
		await replace(editor, 'Inertia::render("About/AboutC|omponent");');
		await assertPath("About/AboutComponent");
	});

	test('inertia.js route', async() => {
		await replace(editor, 'Route::inertia("/about", "About/AboutCom|ponent");');
		await assertPath("About/AboutComponent");
	});

	test('namespace file', async() => {
		await replace(editor, '"App\\Use|r"');
		await assertPath("App\\User.php");
	});

	test('closing tag Component', async() => {
		await replace(editor, "</x-al|ert>");
		await assertPath("alert.php");
	});

	test('component with namespace', async() => {
		await replace(editor, "<x-namespace::|alert/>");
		await assertPath("namespace/alert.php");
	});

	test('component', async() => {
		await replace(editor, '<x-form.|input type="error"/>');
		await assertPath("form/input.php");
	});

	test('view file', async() => {
		await replace(editor, "view('hello|_view', ['name' => 'James']);");
		await assertPath("hello_view.blade.php");
	});

	test('view file in mailable class', async() => {
		await replace(editor, "view: 'ema|ils.test',");
		await assertPath("emails/test.blade.php");
	});

	test('view file in Route::view', async() => {
		await replace(editor, "Route::view('/welcome', 'pages.wel|come', ['name' => 'Taylor']);");
		await assertPath("pages/welcome.blade.php");
	});

	test('view file in config/livewire.php', async() => {
		await replace(editor, "'layout' => 'layou|ts.app',");
		await assertPath("layouts/app.blade.php");
	});

	test('html comment', async() => {
		await replace(editor, "<!-- resources/views/compo|nents/layout -->");
		await assertPath("resources/views/components/layout.blade.php");
	});

	test('blade comment', async() => {
		await replace(editor, "'{{-- resources/views/compo|nents/layout --}}'");
		await assertPath("resources/views/components/layout.blade.php");
	});

	test('blade comment with .blade.php', async() => {
		await replace(editor, "'{{-- resources/views/compo|nents/layout.blade.php --}}'");
		await assertPath("resources/views/components/layout.blade.php");
	});

	test('view var', async() => {
		await replace(editor, "$view = 'he|llo'");
		await assertPath("hello.blade.php");
	});

	test('view file with Namespace', async() => {
		await replace(editor, "view('Namespace::hel|lo_view');");
		await assertPath("hello_view.blade.php");
	});

	test('vendor view', async() => {
		await replace(editor, "view('vendor::he|llo_view');");
		await assertPath("vendor/hello_view.blade.php");
	});

	test('View::first', async() => {
		await replace(editor, "View::first(['firs|t_view', 'second_view']);");
		await assertPath("first_view.blade.php");
	});

	test('View::exists', async() => {
		await replace(editor, "View::exists('hello|_view');");
		await assertPath("hello_view.blade.php");
	});

	test('@includeIf, @include', async() => {
		await replace(editor, "@includeIf('view.na|me', ['status' => 'complete'])");
		await assertPath("view/name.blade.php");
	});

	test('@extends', async() => {
		await replace(editor, "@extends('view.na|me')");
		await assertPath("view/name.blade.php");
	});

	test('@includeUnless, @includeWhen', async() => {
		await replace(editor, "@includeUnless($boolean, 'view|.name', ['status' => 'complete'])");
		await assertPath("view/name.blade.php");
	});

	test('@includeFirst', async() => {
		await replace(editor, "@includeFirst(['custom.admin', 'ad|min'], ['status' => 'complete'])");
		await assertPath("admin.blade.php");
	});

	test('@each', async() => {
		await replace(editor, "@each('view.name', $jobs, 'job', 'view|.empty')");
		await assertPath("view/empty.blade.php");
	});

	test('controller', async () => {
		await await replace(editor, "Route::get('/', 'HelloControlle|r@index');");
		await assertPath("HelloController.php", "@index");
	});

	test('controller with Route::namespace', async() => {
		await replace(editor, `Route::namespace('58')->group(function () {
			Route::get('/', 'HelloControl|ler@index');
		});`);
		await assertPath("58/HelloController.php", "@index");
	});

	test('controller with Route::group()', async() => {
		await replace(editor, `Route::group(['namespace' => '52'], function () {
			Route::get('/', 'HelloContro|ller@index');
		});`);
		await assertPath("52/HelloController.php", "@index");
	});

	test('controller with Route::resource', async() => {
		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'HelloCo|ntroller', ['only' => [
				'index', 'show'
			]]);
		});`);
		await assertPath("Resource/HelloController.php");
	});

	test('controller action with Route::resource', async() => {
		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'HelloController', ['only' => [
				'index', 'sho|w'
			]]);
		});`);
		await assertPath("Resource/HelloController.php", '@show');
	});

	test('controller with $router->group()', async() => {
		await replace(editor, `$router->group(['namespace' => 'Lumen'], function () use ($router) {
			Route::get('/', 'HelloControl|ler@index');
		});`);
		await assertPath("Lumen/HelloController.php", "@index");
	});

	test('controller with absolute path namespace', async() => {
		await replace(editor, `Route::group(['namespace' => 'Abc'], function () {
			Route::get('/', '\\Absolute\\HelloContr|oller@index');
		});`);
		await assertPath("/Absolute/HelloController.php", "@index");
	});

	test('static file', async() => {
		await replace(editor, `'hell|o.JS';`);
		await assertPath("hello.JS");
	});

	test('facade config get', async() => {
		await replace(editor, `Config::get('app.t|imezone');`);
		await assertPath("config/app.php");
	});

	test('facade config set', async() => {
		await replace(editor, `Config::set(   'app.time|zone', 'UTC');`);
		await assertPath("config/app.php");
	});

	test('config get only file', async() => {
		await replace(editor, `config('a|pp');`);
		await assertPath("config/app.php");
	});

	test('config get', async() => {
		await replace(editor, `config('app.time|zone');`);
		await assertPath("config/app.php");
	});

	test('config set', async() => {
		await replace(editor, `config(     ['app.time|zone' => 'UTC']);`);
		await assertPath("config/app.php");
	});

	test('.env', async() => {
		await replace(editor, `env(   'APP_DEB|UG', false);`);
		await assertPath(".env");
	});

	test('lang underscore', async() => {
		await replace(editor, `__('messages.|welcome');`);
		await assertPath("lang/messages.php");
	});

	test('@lang', async() => {
		await replace(editor, `@lang('messages|.welcome');`);
		await assertPath("lang/messages.php");
	});

	test('trans', async() => {
		await replace(editor, `trans('messages.w|elcome');`);
		await assertPath("lang/messages.php");
	});

	test('trans_choice', async() => {
		await replace(editor, `trans_choice('message|s.apples', 10);`);
		await assertPath("lang/messages.php");
	});

	test('package trans', async() => {
		await replace(editor, `trans('package::m|essages');`);
		await assertPath("lang/vendor/package/messages.php");
	});

	test('relative static file path', async() => {
		await replace(editor, `'./../../he|llo.JS';`);
		await assertPath("hello.JS");
	});

	test('config in config', async() => {
		await replace(editor, `config(['app.timezone' => config('ap|p.tz')]);`);
		await assertPath("config/app.php");
	});

	test('app_path', async() => {
		await replace(editor, `app_path('Use|r.php');`);
		await assertPath("app/User.php");
	});

	test('config_path', async() => {
		await replace(editor, `config_path('a|pp.php');`);
		await assertPath('config/app.php');
	});

	test('database_path', async() => {
		await replace(editor, `database_path('UserFa|ctory.php');`);
		await assertPath('database/UserFactory.php');
	});

	test('public_path', async() => {
		await replace(editor, `public_path('css/ap|p.css');`);
		await assertPath('public/css/app.css');
	});

	test('resource_path', async() => {
		await replace(editor, `resource_path('sass/a|pp.scss');`);
		await assertPath('resources/sass/app.scss');
	});

	test('storage_path', async() => {
		await replace(editor, `storage_path('logs/lar|avel.log');`);
		await assertPath('storage/logs/laravel.log');
	});

	test('path_helper_with_double_brackets', async() => {
		await replace(editor, `realpath(storage_path('logs/la|ravel.log'));`);
		await assertPath('storage/logs/laravel.log');
	});

	test('laravel 8 controller with namespace', async() => {
		await replace(editor, `Route::get('/', [L8\\HelloControl|ler::class, 'index']);`);
		await assertPath("L8/HelloController.php", "@index");
	});

	test('laravel 8 controller without action', async() => {
		await replace(editor, `Route::get('/', HelloCo|ntroller::class);`);
		await assertPath("HelloController.php");
	});

	test('laravel 8 controller with action', async() => {
		await replace(editor, `Route::get('/', [HelloController::class, 'in|dex']);`);
		await assertPath("HelloController.php", "@index");
	});

	test('laravel 8 controller with group namespace', async() => {
		await replace(editor, `Route::group(['namespace' => 'L8'], function () {
			Route::get('/', [\\HelloContro|ller::class, 'index']);
		});`);
 		await assertPath("L8/HelloController.php");
	});

	test('middleware', async() => {
	    (workspace as any).getFileContent = async () => {
			return (await fsp.readFile(process.env.EXTENSION_PATH + '/src/test/test-fixtures/app/Http/Kernel.php')).toString();
		};
		await replace(editor, `Route::middleware(['web:1234', 'auth|:abc']);`);
		await assertPath('Http/Middleware/Authenticate.php');

		await replace(editor, `Route::group(['middleware' => ['auth.|basic',]]);`);
		await assertPath('Illuminate/Auth/Middleware/AuthenticateWithBasicAuth.php');
	});
});

async function assertPath(expected: string, location?: string) {
	const selection = getSelection(editor.document, editor.selection, "<\"'[,)>");
	if (!selection) {
		assert.fail();
	}
	const finder = new Finder(editor.document, selection);
	const place = await finder.getPlace();
	assert.strictEqual(place.path, expected);
	if (location) {
		assert.strictEqual(place.location, location);
	}
}

