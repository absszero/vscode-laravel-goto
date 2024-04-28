import * as assert from 'assert';
import { Config } from '../../Config';

suite('Config Test Suite', () => {
	const config = new Config;

	test('facade config', () => {
		let place = config.getPlace('app.timezone', `Config::get('app.timezone');`);
		assert.strictEqual(place.path, "config/app.php");

		place = config.getPlace('app.timezone', `Config::set(   'app.timezone', 'UTC');`);
		assert.strictEqual(place.path, "config/app.php");
	});

	test('config helper', () => {
		let place = config.getPlace('app', `config('app');`);
		assert.strictEqual(place.path, "config/app.php");

		place = config.getPlace('app.{$var}', "config('app.{$var}');");
		assert.strictEqual(place.path, "config/app.php");

		place = config.getPlace('app.timezone', `config('app.timezone');`);
		assert.strictEqual(place.path, "config/app.php");
		assert.ok(place.location.includes('timezone'));

    place = config.getPlace('app.timezone', `config(     ['app.timezone' => 'UTC']);`);
		assert.strictEqual(place.path, "config/app.php");

    place = config.getPlace('app.tz', `config(['app.timezone' => config('app.tz')]);`);
		assert.strictEqual(place.path, "config/app.php");
  });
});
