import * as vscode from 'vscode';
import { ExtensionMode } from 'vscode';

export class LogManager {
    static devMode = false;
    static debug: boolean;
    static files: string;
    static channel: vscode.LogOutputChannel;

    public static isEnabled(): boolean {
        if (undefined === LogManager.debug) {
            LogManager.debug = vscode.workspace.getConfiguration().get('laravelGoto.debug', false);
        }

        if (undefined === LogManager.channel) {
            LogManager.channel = vscode.window.createOutputChannel("Laravel Goto", {log: true});
        }

        return (LogManager.debug || LogManager.devMode);
    }
}

/**
 *
 * @param mode ExtensionMode
 */
export function setDevMode(mode: ExtensionMode) {
    LogManager.devMode = (mode === vscode.ExtensionMode.Development);
}

export function info(caption: string, ...args : string[]) {
    if (LogManager.isEnabled()) {
        const message = caption + ': ' + args.join(', ');
        console.info(message);
        LogManager.channel.info(message);
    }
}

export function error(caption: string, ...args : string[]) {
    if (LogManager.isEnabled()) {
        const message = caption + ': ' + args.join(', ');
        console.error(message);
        LogManager.channel.error(message);
    }
}

export function warn(caption: string, ...args : string[]) {
    if (LogManager.isEnabled()) {
        const message = caption + ': ' + args.join(', ');
        console.warn(message);
        LogManager.channel.warn(message);
    }
}
