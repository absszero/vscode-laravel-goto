import * as vscode from 'vscode';
import { locate, bindSymbol } from './Locator';

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
            bindSymbol(place);

            let command = 'workbench.action.quickOpen';
            let arg : any = place.path;
            if (1 === place.uris.length) {
                command = 'vscode.open';
                arg = vscode.Uri.file(place.uris[0].path);
            }
            const args = encodeURIComponent(JSON.stringify([arg]));
            const commentCommandUri = vscode.Uri.parse(`command:${command}?${args}`);
            const contents = new vscode.MarkdownString(`[${place.path}](${commentCommandUri})`);
            contents.isTrusted = true;

            return new vscode.Hover(contents);
        });
    }
}

