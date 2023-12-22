import * as vscode from 'vscode';
import fsp from "fs/promises";
import { SpawnSyncReturns, spawnSync as spawn } from 'child_process';

const MAX_RESULTS = 2;
const excludes = vscode.workspace.getConfiguration().get('laravelGoto.exclusion', null);
let contents = new Map<string, string>;
let mTimes  = new Map<string, string>;

export function createFileSystemWatcher(glob: string) {
	return vscode.workspace.createFileSystemWatcher(glob);
}

/**
 * locate files
 *
 */
export async function findFiles(glob: string, maxResults = MAX_RESULTS) {
	return await vscode.workspace.findFiles(glob, excludes, maxResults);
}

/**
 * get file content
 *
 * @param   {string| vscode.Uri}  	glob  [glob description]
 *
 * @return  {Promise:<string>}            [return description]
 */
export async function getFileContent(glob: string | vscode.Uri): Promise<string> {
	let uri = glob;
	if (typeof glob === 'string') {
		const uris = await findFiles(glob, 1);
		if (0 === uris.length) {
			return '';
		}

		uri = uris[0];
	}
	const filepath = (uri as vscode.Uri).fsPath;

	// read from cache
	const mTime = (await fsp.stat(filepath)).mtime.toString();
	if (mTimes.get(filepath) === mTime) {
		return contents.get(filepath) || '';

	}

	// read from disk
	const content = (await fsp.readFile(filepath)).toString();
	mTimes.set(filepath, mTime);
	contents.set(filepath, content);

	return content;
}

/**
 * locate files
 *
 */
export function class2path(className: string): string {
	className = className
	.replace('::class', '').
	replace(',', '')
	.replace(/\\/g, '/').trim() + '.php';

	if ('/' === className[0]) {
		className = className.substring(1);
	}

	// glob pattern is case-sensitive, and default app folder is lowercase.
	if (className.startsWith('App/')) {
		className = className.substring('App/'.length);
	}

	return className;
}

/**
 *  spawns a new process using the given command
 *
 * @param   {string}                 command  [command description]
 * @param   {string[]<any>}          args     [args description]
 *
 * @return  {SpawnSyncReturns<any>}           [return description]
 */
export function spawnSync(command: string, args: string[]): SpawnSyncReturns<any> {
	return spawn(command, args);
}