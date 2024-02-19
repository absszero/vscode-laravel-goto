import * as vscode from 'vscode';
import { IOpenAllArgs } from './IOpenAllArgs';
import { locateByLocation } from './Locator';
import { basename } from 'path';

export async function newWindow(content: vscode.ExtensionContext, args: IOpenAllArgs) {
	if (0 === args.files.length) {
		return;
	}
	// store all language files
	await content.globalState.update('open_all', args);

	// open a new window
	const uri = vscode.Uri.file(args.files[0]);
    await vscode.commands.executeCommand("vscode.openFolder", uri, {
		forceNewWindow: true,
	});
}

export async function openAllFiles(content: vscode.ExtensionContext) {
	// a new window should be focused
	if (!vscode.window.state.focused) {
		return;
	}

	// first language file should be loaded
	if (!vscode.window.activeTextEditor) {
		return;
	}

	const args: IOpenAllArgs = content.globalState.get('open_all')!;
	await content.globalState.update('open_all', null);
	if (!args) {
		return;
	}

	if (args.files.length === 0) {
		return;
	}

	args.locations = new Map<string, string>(Object.entries(args.locations));

	// if the opened file is not the first language file, return
	const fsPath = vscode.window.activeTextEditor.document.uri.fsPath;
	if (fsPath !== args.files[0]) {
		return;
	}
	locateByFSPath(vscode.window.activeTextEditor, args, fsPath);

	// open all other language files
	for (let index = 1; index < args.files.length; index++) {
		const uri = vscode.Uri.file(args.files[index]);
		const doc = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
		locateByFSPath(vscode.window.activeTextEditor, args, uri.fsPath);
	}

	// set layout by total number of language files
	const size = 1 / args.files.length;
	const groups:unknown[] = [];
	groups.fill({ size: size } ,0 , args.files.length - 1);
	await vscode.commands.executeCommand("vscode.setEditorLayout", {
		orientation: 0,
		groups: groups,
	});
}

/**
 * locate by file system path
 * @param editor
 * @param args
 * @param fsPath
 */
function locateByFSPath(editor: vscode.TextEditor, args: IOpenAllArgs, fsPath: string): void {
	const filename = basename(fsPath);
	const location = args.locations.get(filename) ?? args.location;
	locateByLocation(editor, location);
}
