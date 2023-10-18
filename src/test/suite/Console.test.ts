import { Uri } from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { Console } from '../../Console';
import { afterEach } from 'mocha';
import * as workspace from '../../Workspace';
import { normalize } from 'path';

suite('Console Test Suite', () => {
	afterEach(() => {
		sinon.restore();
	});

	test('all', async () => {
		const subFindFiles = sinon.stub(workspace, 'findFiles');
		const path = '/../../../src/test/test-fixtures/app/Console/';
		const kernel = Uri.file(normalize(__dirname + path + 'Kernel.php'));
		const files = [
			Uri.file(normalize(__dirname + path + 'Commands/SayHello.php')),
			Uri.file(normalize(__dirname + path + 'Commands/Subdir/SendEmails.php')),
		];
		const registerCmd = Uri.file(normalize(__dirname + path + 'Commands/SayGoodbye.php'));
		subFindFiles.onCall(0).returns(new Promise((resolve) => resolve([kernel])));
		subFindFiles.onCall(1).returns(new Promise((resolve) => resolve(files)));
		subFindFiles.onCall(2).returns(new Promise((resolve) => resolve([registerCmd])));
		const console = (new Console);
		const commands = await console.all();

		assert.ok(commands.has("app:say-hello"));
		assert.ok(commands.has("app:send-mails"));
		assert.ok(commands.has("app:say-goodbye"));
		assert.strictEqual(commands.get("app:say-hello")?.path, 'SayHello.php');
		assert.strictEqual(commands.get("app:send-mails")?.path, 'SendEmails.php');
		assert.strictEqual(commands.get("app:say-goodbye")?.path, 'Console/Commands/SayGoodbye.php');
	});
});
