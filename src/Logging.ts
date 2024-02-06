import * as vscode from 'vscode';
import { ExtensionMode } from 'vscode';

export class Logging {
    static devMode = false;
    static debug: boolean;
    static files: string;
    static channel: vscode.LogOutputChannel;

    public static isEnabled(): boolean {
        if (undefined === Logging.debug) {
            Logging.debug = vscode.workspace.getConfiguration().get('laravelGoto.debug', false);
        }

        if (undefined === Logging.channel) {
            Logging.channel = vscode.window.createOutputChannel("Laravel Goto", {log: true});
        }

        return (Logging.debug || Logging.devMode);
    }
}

/**
 *
 * @param mode ExtensionMode
 */
export function setDevMode(mode: ExtensionMode) {
    Logging.devMode = (mode === vscode.ExtensionMode.Development);
}

export function info(caption: string, ...args : string[]) {
    if (Logging.isEnabled()) {
        const message = caption + ': ' + args.join(', ');
        console.info(message);
        Logging.channel.info(message);
    }
}

export function error(caption: string, ...args : string[]) {
    if (Logging.isEnabled()) {
        const message = caption + ': ' + args.join(', ');
        console.error(message);
        Logging.channel.error(message);
    }
}

export function warn(caption: string, ...args : string[]) {
    if (Logging.isEnabled()) {
        const message = caption + ': ' + args.join(', ');
        console.warn(message);
        Logging.channel.warn(message);
    }
}
