import * as vscode from 'vscode';
import { ExtensionMode } from 'vscode';


export class Logging {
    static DEV_MODE = false;
    static DEBUG: boolean;

    constructor() {
        if (undefined === Logging.DEBUG) {
            Logging.DEBUG = vscode.workspace.getConfiguration().get('laravelGoto.dubug', false);
        }
    }

    /**
     *
     * @param mode ExtensionMode
     */
    public setDevMode(mode: ExtensionMode) {
        Logging.DEV_MODE = (mode === vscode.ExtensionMode.Development);
    }
}

export function log(caption: String, ...args : any) {

    if (!Logging.DEBUG && !Logging.DEV_MODE) {
        return;
    }

    console.log(`[LG]:${caption}`, ...args);
}
