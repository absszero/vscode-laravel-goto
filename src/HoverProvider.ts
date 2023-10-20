import * as vscode from 'vscode';
import { locate, moveToSymbol } from './Locator';

export class HoverProvider implements vscode.HoverProvider {
	public provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	) {
		const range = new vscode.Range(position, position);
		return locate(document, range)
		.then(place => {
			if (undefined === place) {
				return;
			}
			moveToSymbol(place);
			let links = this.markdownUri(place.path, place.uris);
			if (place.paths?.size) {
				links = '';
				for (const [path, uris] of place.paths) {
					links += "- " + this.markdownUri(path, uris) + "\n";
				}
			}
			const contents = new vscode.MarkdownString(links);
			contents.isTrusted = true;

			return new vscode.Hover(contents);
		});
	}

	private markdownUri(path: string, uris?: Array<vscode.Uri>) {
		let arg : string|vscode.Uri = path;
		let command = 'workbench.action.quickOpen';
		if (1 === uris?.length) {
			arg = vscode.Uri.file(uris[0].fsPath);
			command = 'vscode.open';
		}

		const args = encodeURIComponent(JSON.stringify([arg]));
		const commentCommandUri = vscode.Uri.parse(`command:${command}?${args}`);
		return `[${path}](${commentCommandUri})`;
	}
}

