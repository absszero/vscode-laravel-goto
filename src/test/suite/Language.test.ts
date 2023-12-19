import * as assert from 'assert';
import { Language } from '../../Language';
import { teardown } from 'mocha';
import * as workspace from '../../Workspace';
import * as sinon from 'sinon';
import { Uri } from 'vscode';
import * as utils from './Utils';
import { realpathSync } from 'fs';

suite('Language Test Suite', () => {
	teardown(() => {
		sinon.restore();
	});

	test('init', async () => {
		const subFindFiles = sinon.stub(workspace, 'findFiles');
		const base  = realpathSync(utils.testFixturesDirPath('/resources/lang'));
		const enLang = Uri.parse(base + '/en/messages.php');
		subFindFiles.returns(new Promise((resolve) => resolve([enLang])));

		const language = new Language;
		await language.init();
		assert.strictEqual(language.base, base);
		assert.deepStrictEqual(language.langs, ['en', 'tw']);
	});

	test('getPlace', async () => {
		const language = new Language;
		language.base = realpathSync(utils.testFixturesDirPath('/resources/lang'));
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
