import * as vscode from 'vscode';
import { Router } from './Router';
import { findFiles } from './Workspace';
import { fireGotoSymbolEvent } from './Locator';

export default async function () {
	const uris = (new Router).uris();
	const items = Array.from(uris.keys());
	const uri = await vscode.window.showQuickPick(items);
	if (undefined === uri) {
		return;
	}

	const place = uris.get(uri);
	if (undefined === place) {
		return;
	}

	if (place.path) {
		place.uris = await findFiles('**/' + place.path);
	}


	if (place.location) {
		fireGotoSymbolEvent(place);
	}

	if (1 === place.uris.length) {
		await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(place.uris[0].fsPath));
		return;
	}

	await vscode.commands.executeCommand('workbench.action.quickOpen', place.path);
}
