import * as vscode from 'vscode';
import { locate, fireGotoSymbolEvent } from './Locator';

export class HoverProvider implements vscode.HoverProvider {
	static documentFilter() {
		const filter: vscode.DocumentFilter[] = [
			{
				language: "php",
				scheme: "file"
			},
			{
				language: "blade",
				scheme: "file"
			}
		];

		return filter;
	}

	public async provideHover (document: vscode.TextDocument, position: vscode.Position) {
		const range = new vscode.Range(position, position);
		const place = await locate(document, range);
		if (undefined === place) {
			return;
		}

		fireGotoSymbolEvent(place);
		let links = this.markdownUri(place.path, place.uris);
		if (place.paths?.size) {
			links = '';
			for (const [path, uris] of place.paths) {
				links += "- " + this.markdownUri(path, uris) + "\n";
			}

			const fsPaths = place.getUniquePaths();
			if (fsPaths.length) {
				const openAllMarkdown = this.markdownOpenAllUri(fsPaths, place.location, place.locations ?? new Map<string, string>);
				links += openAllMarkdown;
			}
		}
		const contents = new vscode.MarkdownString(links);
		contents.isTrusted = true;

		return new vscode.Hover(contents);
	}

	private markdownUri(path: string, uris: vscode.Uri[]) {
		let arg : string|vscode.Uri = path;
		let command = 'workbench.action.quickOpen';
		if (1 === uris.length) {
			arg = vscode.Uri.file(uris[0].fsPath);
			command = 'vscode.open';
		}

		const args = encodeURIComponent(JSON.stringify([arg]));
		const commentCommandUri = vscode.Uri.parse(`command:${command}?${args}`);
		return `[${path}](${commentCommandUri.toString()})`;
	}

	private markdownOpenAllUri(files: string[], location: string, locations: Map<string, string>) {
		const arg = {files, location, locations: Object.fromEntries(locations)};
		const command = 'extension.vscode-laravel-goto.new-window';
		const args = encodeURI(JSON.stringify([arg]));
		const commentCommandUri = vscode.Uri.parse(`command:${command}?${args}`);
		return `\n\n[Open all files above in new window](${commentCommandUri.toString()})`;
	}
}

