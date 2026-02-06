import * as assert from 'assert';
import { Router } from '../../Router';
import { teardown } from 'mocha';
import * as workspace from '../../Workspace';
import * as sinon from 'sinon';
import { Uri } from 'vscode';

suite('Route Test Suite', () => {
	teardown(() => {
		sinon.restore();
	});

	test('all & uris', async () => {
		const subFindFiles = sinon.stub(workspace, 'findFiles');
		const artisan = Uri.file('artisan_path');
		subFindFiles.returns(new Promise((resolve) => resolve([artisan])));

		const subSpawnSync = sinon.stub(workspace, 'spawnSync');
		subSpawnSync.returns({
			status: 0,
			pid: 0,
			output: [],
			stdout: Buffer.from(`[
				{"name" : "admin.index", "uri":"/admin", "method": "POST", "action" : "App\\\\Http\\\\Controllers\\\\Admin\\\\MainController@index"},
				{"name" : "Closure", "uri":"/closure" , "method": "GET", "action" : "Closure"}
			]`),
			stderr: Buffer.from(''),
			signal: null
		});

		const route = new Router;
		Router.isUpdating = false;
		await route.update();
		const routes = route.all();

		assert.ok(routes.has("admin.index"));
		assert.strictEqual(routes.get("admin.index")?.path, 'Http/Controllers/Admin/MainController.php');
		assert.strictEqual(routes.get("admin.index")?.location, '@index');

		const uris = route.uris();
		assert.strictEqual(1, uris.size);
	});
});
