import * as vscode from 'vscode';
import { locate, moveToSymbol } from './Locator';
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
			moveToSymbol(place);
			let links = this.markdownUri(place.path, place.uris);
			let isOpenAll = false;
			if (place.paths?.size) {
				links = '';
				isOpenAll = true;
				for (const [path, uris] of place.paths) {
					links += "- " + this.markdownUri(path, uris) + "\n";

					isOpenAll &&= (1 === uris.length);
				}
			}
			const contents = new vscode.MarkdownString(links);

			if (isOpenAll) {
				const openAllMarkdown = this.markdownOpenAllUri(
					place.location,
					place.paths as Map<string, Array<vscode.Uri>>
				);
				contents.appendMarkdown(openAllMarkdown);
			}

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

	private markdownOpenAllUri(location: string, paths: Map<string, Array<vscode.Uri>>) {
		const arg = {
			location,
			files: []
		} as IOpenAllArgs;
		for (const [, uris] of paths) {
			arg.files.push(uris[0].fsPath);
		}

		const command = 'extension.vscode-laravel-goto.new-window';
		const args = encodeURI(JSON.stringify([arg]));
		const commentCommandUri = vscode.Uri.parse(`command:${command}?${args}`);
		return `\n\n[Open all files above in new window](${commentCommandUri})`;
	}
}

