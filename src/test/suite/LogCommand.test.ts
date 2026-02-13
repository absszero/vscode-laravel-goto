import * as assert from 'assert';
import * as sinon from 'sinon';
import * as workspace from '../../Workspace';
import { parseLogChannels, findLogFiles } from '../../LogCommand';
import { Uri } from 'vscode';

suite('LogCommand Test Suite', () => {
	teardown(() => {
		sinon.restore();
	});

	test('parseLogChannels', () => {
		const content = `
			'sentry_logs' => [
				'driver' => 'sentry_logs',
				// The minimum logging level at which this handler will be triggered
				// Available levels: debug, info, notice, warning, error, critical, alert, emergency
				'level' => env('LOG_LEVEL', 'debug'),
			],
			'single' => [
					'driver' => 'single',
					'path' => storage_path('logs/laravel.log'),
					'level' => env('LOG_LEVEL', 'debug'),
					'replace_placeholders' => true,
			],
		`;

		const channels = parseLogChannels(content);
		assert.strictEqual(channels.size, 1);
		assert.strictEqual(channels.get('single'), "storage_path('logs/laravel.log')");
	});

	test('findLogFiles', async () => {
		const fs = Uri.parse('file:///path/to/storage/logs/laravel.log')
		sinon.stub(workspace, 'findFiles').resolves([fs]);

		const pathExpression = "storage_path('logs/laravel.log')";
		const files = await findLogFiles(pathExpression);
		assert.strictEqual(files[0].fsPath, fs.fsPath);
	});
});
