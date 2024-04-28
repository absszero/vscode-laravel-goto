import * as assert from 'assert';
import { ClassName } from '../../ClassName';

suite('ClassName Test Suite', () => {
	test('getPlace', () => {
		const interpreter = new ClassName();

		// Test case 1: Valid ClassName with double colons
		let place = interpreter.getPlace('App\\Models\\User::create', 'App\\Models\\User::create();');
		assert.strictEqual(place.path, 'app\\Models\\User.php');
		assert.strictEqual(place.location, '@create');

		// Test case 2: Valid ClassName without double colons
		place = interpreter.getPlace('App\\Models\\Post', 'new App\\Models\\Post();');
		assert.strictEqual(place.path, 'app\\Models\\Post.php');

		// Test case 3: Valid ClassName with leading backslash
		place = interpreter.getPlace('\\App\\Models\\Comment', 'new \\App\\Models\\Comment');
		assert.strictEqual(place.path, 'app\\Models\\Comment.php');
	});
});