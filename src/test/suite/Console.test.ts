import { Uri } from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { Console } from '../../Console';
import { afterEach } from 'mocha';
import * as workspace from '../../Workspace';

suite('Console Test Suite', () => {
	afterEach(() => {
		sinon.restore();
	});

	test('all', async () => {
		const subFindFiles = sinon.stub(workspace, 'findFiles');
		const kernel = Uri.file(__dirname + '/../../../src/test/test-fixtures/app/Console/Kernel.php');
		const files = [
			Uri.file(__dirname + '/../../../src/test/test-fixtures/app/Console/Commands/SayHello.php'),
			Uri.file(__dirname + '/../../../src/test/test-fixtures/app/Console/Commands/Subdir/SendEmails.php'),
		]
		subFindFiles.onCall(0).returns(new Promise((resolve) => resolve([kernel])));
		subFindFiles.onCall(1).returns(new Promise((resolve) => resolve(files)));
		const console = (new Console);
		const commands = await console.all();

		assert.ok(commands.has("app:say-hello"));
		assert.ok(commands.has("app:send-mails"));
		assert.strictEqual(commands.get("app:say-hello")?.path, 'SayHello.php');
		assert.strictEqual(commands.get("app:send-mails")?.path, 'SendEmails.php');
	});
});
