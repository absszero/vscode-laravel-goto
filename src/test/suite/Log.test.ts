import * as assert from 'assert';
import { Log } from '../../Log';

suite('log Test Suite', () => {
	const log = new Log;

	test('channel', () => {
		const place = log.getPlace('slack', "Log::channel('slack')");
		assert.strictEqual(place.path, "config/logging.php");
		assert.ok(place.location.includes('slack'));
	});

	test('stack', () => {
		let place = log.getPlace('slack', "Log::stack(['slack', 'single'])");
		assert.strictEqual(place.path, "config/logging.php");
		assert.ok(place.location.includes('slack'));

		place = log.getPlace('single', "Log::stack(['slack', 'single'])");
		assert.strictEqual(place.path, "config/logging.php");
		assert.ok(place.location.includes('single'));
	});
});
