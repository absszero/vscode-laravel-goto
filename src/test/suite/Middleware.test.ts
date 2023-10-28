import * as assert from 'assert';
import * as vscode from 'vscode';
import { Middleware } from '../../Middleware';
import { teardown } from 'mocha';
import * as workspace from '../../Workspace';

const getFileContent = workspace.getFileContent;
suite('Middleware Test Suite', () => {
	teardown(() => {
		(workspace as any).getFileContent = getFileContent;
	});

	test('all', async () => {
	    (workspace as any).getFileContent = async () => {
			return String.raw`
			use Illuminate\Foundation\Http\Kernel as HttpKernel;
			use App\Http\Middleware\Authenticate as Auth;

			class Kernel extends HttpKernel
			{
				/**
				 * The application's global HTTP middleware stack.
				 */
				protected $middleware = [
					// \App\Http\Middleware\TrustHosts::class,
					\App\Http\Middleware\TrustProxies::class,

				];

				protected $middlewareAliases = [
					'auth' => Auth::class,
					'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
				];
			}
			`;
		};

		const middlewares = await (new Middleware).all();

		assert.ok(middlewares.has("auth"));
		assert.ok(middlewares.has("auth.basic"));
		assert.strictEqual(middlewares.get("auth")?.path, 'Http/Middleware/Authenticate.php');
		assert.strictEqual(middlewares.get("auth.basic")?.path, 'Illuminate/Auth/Middleware/AuthenticateWithBasicAuth.php');
	});
});
