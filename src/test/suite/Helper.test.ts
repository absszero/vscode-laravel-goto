import * as assert from 'assert';
import { Helper } from '../../Helper';

suite('Helper Test Suite', () => {
	const helper = new Helper;

	test('app_path', async () => {
		const place = await helper.getPlace('User.php', `app_path('User.php');`);
		assert.strictEqual(place.path, "app/User.php");
	});

	test('config_path', async () => {
		const place = await helper.getPlace('app.php', `config_path('app.php');`);
		assert.strictEqual(place.path, "config/app.php");
	});

	test('database_path', async () => {
		const place = await helper.getPlace('UserFactory.php', `database_path('UserFactory.php');`);
		assert.strictEqual(place.path, "database/UserFactory.php");
	});

	test('public_path', async () => {
		const place = await helper.getPlace('css/app.css', `public_path('css/app.css');`);
		assert.strictEqual(place.path, "public/css/app.css");
	});

	test('resource_path', async () => {
		const place = await helper.getPlace('sass/app.scss', `resource_path('sass/app.scss');`);
		assert.strictEqual(place.path, "resources/sass/app.scss");
	});

	test('storage_path', async () => {
		const place = await helper.getPlace('logs/laravel.log', `storage_path('logs/laravel.log');`);
		assert.strictEqual(place.path, "storage/logs/laravel.log");
	});

	test('path_helper_with_double_brackets', async () => {
		const place = await helper.getPlace('logs/laravel.log', `realpath(storage_path('logs/laravel.log'));`);
		assert.strictEqual(place.path, "storage/logs/laravel.log");
	});

	test('to_action', async () => {
		const place = await helper.getPlace('show', `to_action([UserController::class, 'show'], ['user' => 1]);`);
		assert.strictEqual(place.path, "UserController.php");
		assert.strictEqual(place.location, "@show");
	});
});
