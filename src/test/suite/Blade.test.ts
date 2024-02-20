import * as assert from 'assert';
import { Blade } from '../../Blade';

suite('Blade Test Suite', () => {
	const blade = new Blade;

	test('view file', () => {
		let place = blade.getPlace('hello_view',  "view('hello_view', ['name' => 'James']);");
		assert.strictEqual(place.path, 'hello_view.blade.php');

		// view file with Namespace
		place = blade.getPlace('Namespace::hello_view', "view('Namespace::hello_view');");
		assert.strictEqual(place.path, "hello_view.blade.php");

		// vendor view
		place = blade.getPlace('vendor::hello_view', "view('vendor::hello_view');");
		assert.strictEqual(place.path, "vendor/hello_view.blade.php");
	});

	test('Livewire method', () => {
		const place = blade.getPlace('layouts.app', "layout('layouts.app')");
		assert.strictEqual(place.path, "layouts/app.blade.php");
	});

	test('view var', () => {
		const place = blade.getPlace('hello', "$view = 'hello'");
		assert.strictEqual(place.path, "hello.blade.php");
	});

	test('View::`exis`ts', () => {
		const place = blade.getPlace('hello_view', "View::exists('hello_view');");
		assert.strictEqual(place.path, "hello_view.blade.php");
	});

	test('View::composer multi', () => {
		const place = blade.getPlace('profile', "View::composer('profile', ProfileComposer::class);");
		assert.strictEqual(place.path, 'profile.blade.php');
	});


	test('View::creator', () => {
		const place = blade.getPlace('profile', "View::creator('profile', ProfileComposer::class);");
		assert.strictEqual(place.path, 'profile.blade.php');
	});

	test('view file in mailable class', () => {
		let place = blade.getPlace('emails.test', "view: 'emails.test',");
		assert.strictEqual(place.path, "emails/test.blade.php");

		place = blade.getPlace('emails.test', "html: 'emails.test',");
		assert.strictEqual(place.path, "emails/test.blade.php");

		place = blade.getPlace('emails.test', "text: 'emails.test',");
		assert.strictEqual(place.path, "emails/test.blade.php");

		place = blade.getPlace('emails.test', "markdown: 'emails.test',");
		assert.strictEqual(place.path, "emails/test.blade.php");
	});

	test('view file in Route::view', () => {
		const place = blade.getPlace('pages.welcome', "Route::view('/welcome', 'pages.welcome', ['name' => 'Taylor']);");
		assert.strictEqual(place.path, "pages/welcome.blade.php");
	});

	test('view file in config/livewire.php', () => {
		const place = blade.getPlace('layouts.app', "'layout' => 'layouts.app',");
		assert.strictEqual(place.path, "layouts/app.blade.php");
	});

	test('@includeIf, @include', () => {
		let place = blade.getPlace('view.name', "@include('view.name', ['status' => 'complete'])");
		assert.strictEqual(place.path, "view/name.blade.php");

		place = blade.getPlace('view.name', "@includeIf('view.name', ['status' => 'complete'])");
		assert.strictEqual(place.path, "view/name.blade.php");
	});

	test('@extends', () => {
		const place = blade.getPlace('view.name', "@extends('view.name')");
		assert.strictEqual(place.path, "view/name.blade.php");
	});

	test('@includeUnless, @includeWhen', () => {
		let place = blade.getPlace('view.name', "@includeUnless($boolean, 'view.name', ['status' => 'complete'])");
		assert.strictEqual(place.path, "view/name.blade.php");

		place = blade.getPlace('view.name', "@includeWhen($boolean, 'view.name', ['status' => 'complete'])");
		assert.strictEqual(place.path, "view/name.blade.php");
	});

	test('html comment', () => {
		let place = blade.getPlace('resources/views/components/layout', "<!-- resources/views/components/layout -->");
		assert.strictEqual(place.path, "resources/views/components/layout.blade.php");

		place = blade.getPlace('resources/views/components/layout', "'{{-- resources/views/components/layout --}}'");
		assert.strictEqual(place.path, "resources/views/components/layout.blade.php");

		place = blade.getPlace('resources/views/components/layout.blade.php', "'{{-- resources/views/components/layout.blade.php --}}'");
		assert.strictEqual(place.path, "resources/views/components/layout.blade.php");
	});


	test('View::first', () => {
		let place = blade.getPlace('first_view', "View::first(['first_view', 'second_view']);");
		assert.strictEqual(place.path, "first_view.blade.php");

		place = blade.getPlace('second_view', "View::first(['first_view', 'second_view']);");
		assert.strictEqual(place.path, "second_view.blade.php");
	});

	test('@includeFirst', () => {
		let place = blade.getPlace('custom.admin', "@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])");
		assert.strictEqual(place.path, "custom/admin.blade.php");

		place = blade.getPlace('admin', "@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])");
		assert.strictEqual(place.path, "admin.blade.php");
	});

	test('View::composer multi', () => {
		let place = blade.getPlace('profile', "View::composer(['profile', 'dashboard'], MultiComposer::class);");
		assert.strictEqual(place.path, 'profile.blade.php');

		place = blade.getPlace('dashboard', "View::composer(['profile', 'dashboard'], MultiComposer::class);");
		assert.strictEqual(place.path, 'dashboard.blade.php');
	});

	test('@each', () => {
		let place = blade.getPlace('view.empty', "@each('view.name', $jobs, 'job', 'view.empty')");
		assert.strictEqual(place.path, "view/empty.blade.php");

		place = blade.getPlace('view.name', "@each('view.name', $jobs, 'job', 'view.empty')");
		assert.strictEqual(place.path, "view/name.blade.php");
	});

	test('multi lines', () => {
		const place = blade.getPlace('hello_view', "'hello_view', ['name' => 'James']", `view(
			'hello_view', ['name' => 'James']
		);`);
		assert.strictEqual(place.path, "hello_view.blade.php");
	});
});
