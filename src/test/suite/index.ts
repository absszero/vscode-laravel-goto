import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';
import * as fs from 'fs';

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		let filePattern = '**/**.test.js';

		if (process.env.TEST_FILE) {
			const prevousFilename = process.env.EXTENSION_PATH + '/.vscode-test/.prevous';
			if (process.env.TEST_FILE.endsWith('test.ts')) {
				filePattern = process.env.TEST_FILE;
				filePattern = filePattern.replace('src/test/', '');
				filePattern = filePattern.replace('.ts', '.js');

				fs.writeFile(prevousFilename, filePattern, err => null);
			} else {
				if (fs.existsSync(prevousFilename) ) {
					filePattern = fs.readFileSync(prevousFilename, 'utf8');
				}
			}
		}

		glob(filePattern, { cwd: testsRoot }, (err, files) => {
			if (err) {
				return e(err);
			}

			// Add files to the test suite
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				e(err);
			}
		});
	});
}
