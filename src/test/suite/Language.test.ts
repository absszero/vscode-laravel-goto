import * as assert from 'assert';
import { Language } from '../../Language';
import { teardown } from 'mocha';
import * as workspace from '../../Workspace';
import * as sinon from 'sinon';
import * as utils from './Utils';

suite('Language Test Suite', () => {
	teardown(() => {
		sinon.restore();
	});

	test('init', async () => {
		const findFolder = sinon.stub(workspace, 'findFolder');
		const base = utils.testFixturesDirPath('/resources/lang');
		findFolder.returns(new Promise((resolve) => resolve(base)));

		const language = new Language;
		await language.init();
		assert.strictEqual(language.base, base);
		language.langs.sort();
		assert.deepStrictEqual(language.langs, ['en', 'nl.json', 'tw']);
	});

	test('getPlace', async () => {
		const language = new Language;
		language.base = utils.testFixturesDirPath('/resources/lang');
		language.langs = [
			'en'
		];

		let place = await language.getPlace('messages.title');
		assert.strictEqual(place.path, 'lang/messages.php');
		assert.ok(place.location.includes('title'));
		assert.ok(place.paths?.has('lang/en/messages.php'));

		// vendor
		place = await language.getPlace('pkg::messages.title');
		assert.strictEqual(place.path, 'lang/vendor/pkg/messages.php');
		assert.ok(place.paths?.has('lang/vendor/pkg/en/messages.php'));
	});
});
