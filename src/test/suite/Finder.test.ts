import * as sinon from 'sinon';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after, afterEach } from 'mocha';
import { getSelection } from '../../Locator';
import { Finder } from '../../Finder';
import { replace } from './Utils';
import { Middleware } from '../../Middleware';
import { Console } from '../../Console';
import { Place } from '../../Place';
import { Router } from '../../Router';
import { Language } from '../../Language';

let editor: vscode.TextEditor;

suite('Finder Test Suite', () => {
	before(async () => {
		const document = await vscode.workspace.openTextDocument({ language: 'php' });
		editor = await vscode.window.showTextDocument(document);
	});

	after(async () => {
		return await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	afterEach(() => {
		sinon.restore();
	});

	test('Livewire tag', async () => {
		await replace(editor, '<livewire:nav.sho|w-post>');
		await assertPath("Nav/ShowPost.php");
	});

	test('Livewire blade directive', async () => {
		await replace(editor, '@livewire("nav.show|-post")');
		await assertPath("Nav/ShowPost.php");
	});

	test('inertia.js function', async () => {
		await replace(editor, 'inertia("About/AboutCo|mponent");');
		await assertPath("About/AboutComponent");
	});

	test('inertia.js render', async () => {
		await replace(editor, 'Inertia::render("About/AboutC|omponent");');
		await assertPath("About/AboutComponent");
	});

	test('inertia.js route', async () => {
		await replace(editor, 'Route::inertia("/about", "About/AboutCom|ponent");');
		await assertPath("About/AboutComponent");
	});

	test('namespace file', async () => {
		await replace(editor, '"App\\Use|r"');
		await assertPath("app\\User.php");

		await replace(editor, '"\\App\\Use|r"');
		await assertPath("app\\User.php");
	});

	test('closing tag Component', async () => {
		await replace(editor, "</x-hello-al|ert>");
		const place = await assertPath("views/components/hello-alert.blade.php");
		assert.ok(place.paths?.has("View/Components/HelloAlert.php"));
		assert.ok(place.paths?.has("views/components/hello-alert.blade.php"));
	});

	test('component with namespace', async () => {
		await replace(editor, "<x-namespace::|alert/>");
		await assertPath("namespace/alert.blade.php");
	});

	test('component with sub-view', async () => {
		await replace(editor, '<x-form.|input type="error"/>');
		await assertPath("views/components/form/input.blade.php");
	});

	test('controller', async () => {
		await replace(editor, "Route::get('/', 'HelloControlle|r@index');");
		await assertPath("HelloController.php", "@index");
	});

	test('controller with Route::namespace', async () => {
		await replace(editor, `Route::namespace('58')->group(function () {
			Route::get('/', 'HelloControl|ler@index');
		});`);
		await assertPath("58/HelloController.php", "@index");
	});

	test('controller with Route::group()', async () => {
		await replace(editor, `Route::group(['namespace' => '52'], function () {
			Route::get('/', 'HelloContro|ller@index');
		});`);
		await assertPath("52/HelloController.php", "@index");
	});

	test('controller with Route::resource', async () => {
		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'HelloCo|ntroller', ['only' => [
				'index', 'show'
			]]);
		});`);
		await assertPath("Resource/HelloController.php");
	});

	test('controller action with Route::resource', async () => {
		await replace(editor, `Route::group(['namespace' => 'Resource'], function () {
			Route::resource('photo', 'HelloController', ['only' => [
				'index', 'sho|w'
			]]);
		});`);
		await assertPath("Resource/HelloController.php", '@show');
	});

	test('controller with $router->group()', async () => {
		await replace(editor, `$router->group(['namespace' => 'Lumen'], function () use ($router) {
			Route::get('/', 'HelloControl|ler@index');
		});`);
		await assertPath("Lumen/HelloController.php", "@index");
	});

	test('controller with absolute path namespace', async () => {
		await replace(editor, `Route::group(['namespace' => 'Abc'], function () {
			Route::get('/', '\\Absolute\\HelloContr|oller@index');
		});`);
		await assertPath("/Absolute/HelloController.php", "@index");
	});

	test('static file', async () => {
		await replace(editor, `'hell|o.JS';`);
		await assertPath("hello.JS");
	});

	test('filesystem', async () => {
		await replace(editor, `Storage::disk('lo|cal')->put('example.txt', 'Contents');`);
		await assertPath("config/filesystems.php", "(['\"]{1})local\\1\\s*=>");
	});

	test('.env', async () => {
		await replace(editor, `env(   'APP_DEB|UG', false);`);
		await assertPath(".env");
	});

	test('language', async () => {
		sinon.stub(Language.prototype, 'getPlace').returns(new Promise((resolve) => {
			const place = new Place({
				path: 'lang/messages.php',
				location: '',
				uris: [],
				paths: new Map
			});
			resolve(place);
		}));


		await replace(editor, `__('messages.|welcome');`);
		await assertPath("lang/messages.php", undefined, "uderscores");

		await replace(editor, `@lang('messages|.welcome');`);
		await assertPath("lang/messages.php", undefined, "@lang");

		await replace(editor, `trans('messages.w|elcome');`);
		await assertPath("lang/messages.php", undefined, "trans");

		await replace(editor, `trans_choice('message|s.apples', 10);`);
		await assertPath("lang/messages.php", undefined, "trans_choice");
	});

	test('relative static file path', async () => {
		await replace(editor, `'./../../he|llo.JS';`);
		await assertPath("hello.JS");
	});

	test('config in config', async () => {
		await replace(editor, `config(['app.timezone' => config('ap|p.tz')]);`);
		await assertPath("config/app.php");
	});

	test('app_path', async () => {
		await replace(editor, `app_path('Use|r.php');`);
		await assertPath("app/User.php");
	});

	test('config_path', async () => {
		await replace(editor, `config_path('a|pp.php');`);
		await assertPath('config/app.php');
	});

	test('database_path', async () => {
		await replace(editor, `database_path('UserFa|ctory.php');`);
		await assertPath('database/UserFactory.php');
	});

	test('public_path', async () => {
		await replace(editor, `public_path('css/ap|p.css');`);
		await assertPath('public/css/app.css');
	});

	test('resource_path', async () => {
		await replace(editor, `resource_path('sass/a|pp.scss');`);
		await assertPath('resources/sass/app.scss');
	});

	test('storage_path', async () => {
		await replace(editor, `storage_path('logs/lar|avel.log');`);
		await assertPath('storage/logs/laravel.log');
	});

	test('path_helper_with_double_brackets', async () => {
		await replace(editor, `realpath(storage_path('logs/la|ravel.log'));`);
		await assertPath('storage/logs/laravel.log');
	});

	test('laravel 8 controller with namespace', async () => {
		await replace(editor, `Route::get('/', [L8\\\\\\\\HelloControl|ler::class, 'index']);`);
		await assertPath("L8/HelloController.php", "@index");
	});

	test('laravel 8 controller without action', async () => {
		await replace(editor, `Route::get('/', HelloCo|ntroller::class);`);
		await assertPath("HelloController.php");
	});

	test('laravel 8 controller with action', async () => {
		await replace(editor, `Route::get('/', [HelloController::class, 'in|dex']);`);
		await assertPath("HelloController.php", "@index");
	});

	test('laravel 8 controller with group namespace', async () => {
		await replace(editor, `Route::group(['namespace' => 'L8'], function () {
			Route::get('/', [\\HelloContro|ller::class, 'index']);
		});`);
		await assertPath("L8/HelloController.php");
	});

	test('middleware', async () => {
		sinon.stub(Middleware.prototype, 'all').returns(new Promise((resolve) => {
			const middlewares = new Map([
				['auth', new Place({ path: 'Http/Middleware/Authenticate.php', location: '', uris: [] })],
				['auth.basic', new Place({ path: 'Illuminate/Auth/Middleware/AuthenticateWithBasicAuth.php', location: '', uris: [] })],
			]);
			resolve(middlewares);
		}));

		await replace(editor, `Route::middleware(['web:1234', 'auth|:abc']);`);
		await assertPath('Http/Middleware/Authenticate.php');

		await replace(editor, `Route::group(['middleware' => ['auth.|basic',]]);`);
		await assertPath('Illuminate/Auth/Middleware/AuthenticateWithBasicAuth.php');
	});

	test('command', async () => {
		sinon.stub(Console.prototype, 'all').returns(new Promise((resolve) => {
			const commands = new Map([
				['app:say-hello', new Place({ path: 'SayHello.php', location: '', uris: [] })],
			]);
			resolve(commands);
		}));

		await replace(editor, `Artisan::call('app:say|-hello --args');`);
		await assertPath('SayHello.php');

		await replace(editor, `command('app:say|-hello --args');`);
		await assertPath('SayHello.php');
	});

	test('route function', async () => {
		sinon.stub(Router.prototype, 'all').returns(new Map([
			['admin.index', new Place({ path: 'Http/Controllers/Admin/MainController.php', location: '@index', uris: [] })],
		]));

		await replace(editor, `route('admin.in|dex');`);
		await assertPath('Http/Controllers/Admin/MainController.php', '@index');

		await replace(editor, `'route' => 'admin.in|dex'`);
		await assertPath('Http/Controllers/Admin/MainController.php', '@index');
	});

	test('multiline', async () => {
		sinon.stub(Middleware.prototype, 'all').returns(new Promise((resolve) => {
			const middlewares = new Map([
				['auth', new Place({ path: 'Http/Middleware/Authenticate.php', location: '', uris: [] })],
				['auth.basic', new Place({ path: 'Illuminate/Auth/Middleware/AuthenticateWithBasicAuth.php', location: '', uris: [] })],
			]);
			resolve(middlewares);
		}));

		const examples = new Map([
			[
				'layouts/app.blade.php',
				`layout(
					'lay|outs.app'
				)`
			],
			[
				'Http/Middleware/Authenticate.php',
				`Route::middleware(
					[
						'web:1234',
						'auth|:abc'
					]
				);`
			],
			[
				'About/AboutComponent',
				`inertia(
					'About/AboutCo|mponent'
				);`,
			],
			[
				'HelloController.php',
				`Route::get(
					'/', 'HelloControlle|r@index'
				);`,
			],
			[
				'config/app.php',
				`Config::get(
					'app.t|imezone'
				);`,
			],
			[
				'.env',
				`env(
					'APP_DEB|UG'
					, false
				);`
			],
			[
				'app/User.php',
				`app_path(
					'Use|r.php'
				);`
			]
		]);

		for (const [expected, content] of examples) {
			await replace(editor, content);
			await assertPath(expected);
		}
	});
});

async function assertPath(expected: string, location?: string, message?: string): Promise<Place> {
	const selection = getSelection(editor.document, editor.selection, "<\"'[,)>");
	if (!selection) {
		assert.fail();
	}
	const finder = new Finder(editor.document, selection);
	const place = await finder.getPlace();
	assert.strictEqual(place.path, expected, message);
	if (location) {
		assert.strictEqual(place.location, location, message);
	}

	return place;
}

