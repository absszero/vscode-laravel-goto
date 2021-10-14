import * as vscode from 'vscode';
import { basename } from 'path';
import { Finder } from './Finder';
import { getSelection, bindSymbol } from './Locator';

export class HoverProvider implements vscode.HoverProvider {
    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ) {
        const range = new vscode.Range(position, position);

        const selection = getSelection(document, range, "\"'[,)");
        if (null === selection) {
            return undefined;
        }

        const finder = new Finder(document, selection);
        const place = finder.getPlace();
        if (!place.path) {
            return undefined;
        }

        bindSymbol(place);

        const args = encodeURIComponent(JSON.stringify([place.path]));
        const commentCommandUri = vscode.Uri.parse(`command:workbench.action.quickOpen?${args}`);
        const contents = new vscode.MarkdownString(`[${place.path}](${commentCommandUri})`);
        contents.isTrusted = true;

        return new vscode.Hover(contents);
    }
}

