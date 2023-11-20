import * as vscode from 'vscode';
import { ExtensionMode } from 'vscode';


export class Logging {
    static devMode = false;
    static debug: boolean;
    static files: string;

    constructor() {
        if (undefined === Logging.debug) {
            Logging.debug = vscode.workspace.getConfiguration().get('laravelGoto.dubug', false);
        }
    }

    /**
     *
     * @param mode ExtensionMode
     */
    public setDevMode(mode: ExtensionMode) {
        Logging.devMode = (mode === vscode.ExtensionMode.Development);
    }
}

export function log(caption: String, ...args : any) {
    if (Logging.debug || Logging.devMode) {
        console.log(`[LG]:${caption}`, ...args);
    }
}
