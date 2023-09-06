import * as vscode from 'vscode';
import {promises as fsp} from "fs";

const MAX_RESULTS = 2;
const excludes = vscode.workspace.getConfiguration().get('laravelGoto.exclusion', null);

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
    let content = '';
    if (uri.length) {
        content = (await fsp.readFile(uri[0].path)).toString();
    }

    return content;
}