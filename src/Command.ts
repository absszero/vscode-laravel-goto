import * as vscode from 'vscode';
import { basename } from 'path';
import { Finder } from './Finder';
import { getSelection, bindSymbol } from './Locator';

export default (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
    const selection = getSelection(editor.document, editor.selection, "\"'[,)");
    if (!selection) {
        return;
    }
    const finder = new Finder(editor.document, selection);
    const place = finder.getPlace();

    if (place.path) {
        bindSymbol(place);
        vscode.commands.executeCommand('workbench.action.quickOpen', place.path);
    }
};