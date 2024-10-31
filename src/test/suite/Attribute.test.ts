import * as assert from 'assert';
import { Attribute } from '../../Attribute';

suite('Attribute Test Suite', () => {
	const attribute = new Attribute;

	test('contextual attributes', () => {
		let place = attribute.getPlace('web', `#[Auth('web')]`);
		assert.strictEqual(place.path, "config/auth.php");
		assert.strictEqual(place.location, `['"]web['"]\\s*=>`);

		place = attribute.getPlace('redis', `#[Cache('redis')]`);
		assert.strictEqual(place.path, "config/cache.php");
		assert.strictEqual(place.location, `['"]redis['"]\\s*=>`);

		place = attribute.getPlace('app.timezone', `#[Config('app.timezone')]`);
		assert.strictEqual(place.path, "config/app.php");
		assert.strictEqual(place.location, `['"]timezone['"]\\s*=>`);

		place = attribute.getPlace('mysql', `#[DB('mysql')]`);
		assert.strictEqual(place.path, "config/database.php");
		assert.strictEqual(place.location, `['"]mysql['"]\\s*=>`);

		place = attribute.getPlace('daily', `#[Log('daily')]`);
		assert.strictEqual(place.path, "config/logging.php");
		assert.strictEqual(place.location, `['"]daily['"]\\s*=>`);

		place = attribute.getPlace('s3', `#[Storage('s3')]`);
		assert.strictEqual(place.path, "config/filesystems.php");
		assert.strictEqual(place.location, `['"]s3['"]\\s*=>`);
  });
});
