import { Uri } from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { Console } from '../../Console';
import { afterEach } from 'mocha';
import * as workspace from '../../Workspace';
import * as utils from './Utils';

suite('Console Test Suite', () => {
	afterEach(() => {
		sinon.restore();
	});

	test('all', async () => {
		const subFindFiles = sinon.stub(workspace, 'findFiles');
		const path = utils.testFixturesDirPath('/app/Console/');
		const kernel = Uri.file(path + '/Kernel.php');
		const files = [
			Uri.file(path + '/Commands/SayHello.php'),
			Uri.file(path + '/Commands/Subdir/SendEmails.php'),
		];
		const registerCmd = Uri.file(path + '/Commands/SayGoodbye.php');
		subFindFiles.onCall(0).returns(new Promise((resolve) => resolve([kernel])));
		subFindFiles.onCall(1).returns(new Promise((resolve) => resolve(files)));
		subFindFiles.onCall(2).returns(new Promise((resolve) => resolve([registerCmd])));
		const commands = await (new Console).all();

		assert.ok(commands.has("app:say-hello"));
		assert.ok(commands.has("app:send-mails"));
		assert.ok(commands.has("app:say-goodbye"));
		assert.strictEqual(commands.get("app:say-hello")?.path, 'SayHello.php');
		assert.strictEqual(commands.get("app:send-mails")?.path, 'SendEmails.php');
		assert.strictEqual(commands.get("app:say-goodbye")?.path, 'Console/Commands/SayGoodbye.php');
	});
});
