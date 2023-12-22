import * as vscode from 'vscode';
import { ExtensionMode } from 'vscode';

export class Logging {
    static devMode = false;
    static debug: boolean;
    static files: string;
    static channel: vscode.OutputChannel;
}

/**
 *
 * @param mode ExtensionMode
 */
export function setDevMode(mode: ExtensionMode) {
    Logging.devMode = (mode === vscode.ExtensionMode.Development);
}

export function log(caption: String, ...args : Array<string>) {
    if (undefined === Logging.debug) {
        Logging.debug = vscode.workspace.getConfiguration().get('laravelGoto.debug', false);
    }

    if (undefined === Logging.channel) {
        Logging.channel = vscode.window.createOutputChannel("Laravel Goto", {log: true});
    }

    if (Logging.debug || Logging.devMode) {
        Logging.channel.appendLine(caption + ': ' + args.join(', '));
    }
}
