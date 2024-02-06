import * as vscode from 'vscode';

export interface IPlace {
	path: string; // the keyword of path
	uris: vscode.Uri[]; // the real paths of the keyword path
	location: string; // the text in document
	paths?: Map<string, vscode.Uri[]>; // multi keyword paths
}
