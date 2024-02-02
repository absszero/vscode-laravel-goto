import * as vscode from 'vscode';
import { IOpenAllArgs } from './IOpenAllArgs';
import { locateByLocation } from './Locator';

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

export async function openAllfiles(content: vscode.ExtensionContext) {
	// a new window should be focused
	if (!vscode.window.state.focused) {
		return;
	}

	// first lanaguage file should be loaded
	if (!vscode.window.activeTextEditor) {
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const args = content.globalState.get('open_all')! as IOpenAllArgs;
	await content.globalState.update('open_all', null);
	if (!args?.files || args.files.length === 0) {
		return;
	}

	// if the opened file is not the first language file, return
	const fsPath = vscode.window.activeTextEditor.document.uri.fsPath;
	if (fsPath !== args.files[0]) {
		return;
	}
	locateByLocation(vscode.window.activeTextEditor, args.location);

	// open all other language files
	for (let index = 1; index < args.files.length; index++) {
		const uri = vscode.Uri.file(args.files[index]);
		const doc = await vscode.workspace.openTextDocument(uri);
		await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
		locateByLocation(vscode.window.activeTextEditor, args.location);
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


