import * as path from 'path';
import Mocha from 'mocha';
import { globSync } from 'glob';

export function run(): Promise<void> {
	// Create the mocha test runner
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
		timeout: 20000
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((resolve, reject) => {
		// Auto-discover and load test files matching *.test.js pattern
		let files = globSync('**/**.test.js', { cwd: testsRoot });

		// Support filtering by TEST_FILE environment variable (for launch.json debug configs)
		if (process.env.TEST_FILE) {
			const testFile = process.env.TEST_FILE.replace(/\.ts$/, '.js')
				.replace(/^.*src\/test\//, '')
				.replace(/\\/g, '/');
			files = files.filter(f => f.includes(testFile));
		}

		files.forEach(file => mocha.addFile(path.resolve(testsRoot, file)));

		try {
			// Run the mocha tests
			mocha.run(failures => {
				if (failures > 0) {
					reject(new Error(`${failures} tests failed.`));
				} else {
					resolve();
				}
			});
		} catch (err) {
			reject(err);
		}
	});
}
