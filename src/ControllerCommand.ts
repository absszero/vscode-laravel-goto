import * as vscode from 'vscode';
import { Router } from './Router';
import { findFiles } from './Workspace';
import { fireGotoSymbolEvent } from './Locator';
import { RouteItem } from './RouteItem';
import { error } from './Logging';

export default async function () {
	const uris = (new Router).uris();
	const quickPick = vscode.window.createQuickPick<RouteItem>();
	quickPick.items = Array.from(uris.values());

	if (0 === quickPick.items.length) {
		error('Go to Controller', 'No routes found.');
		await vscode.window.showInformationMessage('No routes found.');
		return;
	}

	quickPick.onDidAccept(async () => {
		quickPick.hide();

		const item = quickPick.selectedItems[0];
		if (undefined === item) {
			return;
		}

		const place = item.place;
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
	});

	quickPick.show();
}
