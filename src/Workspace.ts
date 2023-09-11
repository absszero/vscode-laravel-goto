import * as vscode from 'vscode';
import {promises as fsp} from "fs";

const MAX_RESULTS = 2;
const excludes = vscode.workspace.getConfiguration().get('laravelGoto.exclusion', null);
let contents = new Map<string, string>;
let mTimes  = new Map<string, string>;
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
 * @param   {string}  pathGlob  [pathGlob description]
 *
 * @return  {Promise:<string>}            [return description]
 */
export async function getFileContent(pathGlob: string): Promise<string> {
    const uri = await findFiles('**/' + pathGlob, 1);
    if (0 === uri.length) {
        return '';
    }
    const filepath = uri[0].path;

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