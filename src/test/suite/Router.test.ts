import * as assert from 'assert';
import { Router } from '../../Router';
import { teardown } from 'mocha';
import * as workspace from '../../Workspace';
import * as cp from 'child_process';
import * as sinon from 'sinon';
import { Uri } from 'vscode';

suite('Route Test Suite', () => {
	teardown(() => {
		sinon.restore();
	});

	test('all', async () => {
		const subFindFiles = sinon.stub(workspace, 'findFiles');
		const artisan = Uri.file('artisan_path');
		subFindFiles.returns(new Promise((resolve) => resolve([artisan])));

		const subSpawnSync = sinon.stub(cp, 'spawnSync');
		subSpawnSync.returns({
			status: 0,
			pid: 0,
			output: [],
			stdout: Buffer.from('[{"name":"admin.index","action":"App\\\\Http\\\\Controllers\\\\Admin\\\\MainController@index"}]'),
			stderr: Buffer.from(''),
			signal: null
		});

		const route = new Router;
		await route.update();
		const routes = route.all();

		assert.ok(routes.has("admin.index"));
		assert.strictEqual(routes.get("admin.index")?.path, 'Http/Controllers/Admin/MainController.php');
		assert.strictEqual(routes.get("admin.index")?.location, '@index');
	});
});
