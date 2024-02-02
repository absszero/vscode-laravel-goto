import * as path from 'path';
import Mocha from 'mocha';
import { globSync } from 'glob';
import * as fs from 'fs';
import * as vscode from 'vscode';

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
			const previous = process.env.EXTENSION_PATH + path.join('/', '.vscode-test', '.previous');

			let lineNumber = '';
			if (process.env.TEST_FILE.endsWith('test.ts')) {
				filePattern = process.env.TEST_FILE;
				if (process.env.TEST_FILE_LINE) {
					lineNumber = process.env.TEST_FILE_LINE;
				}

				fs.writeFile(previous, filePattern + ':' + lineNumber, () => null);
			} else {
				if (fs.existsSync(previous) ) {
					const content = fs.readFileSync(previous, 'utf8').split(':');
					filePattern = content[0];
					lineNumber = content[1];
				}
			}

			getTestCase(filePattern, +lineNumber)
			.then((testCase) => testCase && mocha.grep(testCase))
			.catch(err => e(err));

			filePattern = filePattern.replace(path.join('src/test/'), path.join('out/test'));
			filePattern = filePattern.replace('.ts', '.js');
			filePattern = filePattern.charAt(0).toLocaleLowerCase() + filePattern.slice(1);
			filePattern = filePattern.replace(testsRoot, '');
			filePattern = filePattern.replace(/\\/g,'/');
		}

		const files = globSync(filePattern, { cwd: testsRoot });
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
}

async function getTestCase(filename: string, lineNumber: number) : Promise<string> {
	const document = await vscode.workspace.openTextDocument(filename);
	while (lineNumber > 0) {
		const lineText = document.lineAt(lineNumber).text;
		const match = lineText.match(/test\(\s*['"`]([^'"`]+)/);
		if (match) {
			return match[1];
		}
		--lineNumber;
	}

	return '';
}
