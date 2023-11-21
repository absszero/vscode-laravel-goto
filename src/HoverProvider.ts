import * as vscode from 'vscode';
import { locate, fireGotoSymbolEvent } from './Locator';
import { IOpenAllArgs } from './IOpenAllArgs';

export class HoverProvider implements vscode.HoverProvider {
	static documentFilter() {
		const php: vscode.DocumentFilter = {
			language: "php",
			scheme: "file"
		};

		return php;
	}

	public async provideHover (
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
			fireGotoSymbolEvent(place);
			let links = this.markdownUri(place.path, place.uris);
			if (place.paths?.size) {
				links = '';
				const fsPaths: Array<string> = [];

				for (const [path, uris] of place.paths) {
					links += "- " + this.markdownUri(path, uris) + "\n";

					// if every path has only one uri, add open all markdown
					if (1 === uris.length) {
						fsPaths.push(uris[0].fsPath);
					}
				}

				if (fsPaths.length === place.paths.size) {
					const openAllMarkdown = this.markdownOpenAllUri(place.location, fsPaths);
					links += openAllMarkdown;
				}
			}
			const contents = new vscode.MarkdownString(links);
			contents.isTrusted = true;

			return new vscode.Hover(contents);
		});
	}

	private markdownUri(path: string, uris: Array<vscode.Uri>) {
		let arg : string|vscode.Uri = path;
		let command = 'workbench.action.quickOpen';
		if (1 === uris.length) {
			arg = vscode.Uri.file(uris[0].fsPath);
			command = 'vscode.open';
		}

		const args = encodeURIComponent(JSON.stringify([arg]));
		const commentCommandUri = vscode.Uri.parse(`command:${command}?${args}`);
		return `[${path}](${commentCommandUri})`;
	}

	private markdownOpenAllUri(location: string, files: Array<string>) {
		const arg = {location, files} as IOpenAllArgs;

		const command = 'extension.vscode-laravel-goto.new-window';
		const args = encodeURI(JSON.stringify([arg]));
		const commentCommandUri = vscode.Uri.parse(`command:${command}?${args}`);
		return `\n\n[Open all files above in new window](${commentCommandUri})`;
	}
}

