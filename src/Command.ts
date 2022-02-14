import * as vscode from 'vscode';
import { locate, moveToSymbol } from './Locator';

export default (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
    locate(editor.document, editor.selection)
    .then(place => {
        if (undefined === place) {
            return;
        }

        moveToSymbol(place);

        if (1 === place.uris.length) {
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(place.uris[0].path));
            return;
        }

        vscode.commands.executeCommand('workbench.action.quickOpen', place.path);
    });
};