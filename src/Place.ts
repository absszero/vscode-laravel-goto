import * as vscode from 'vscode';

export interface Place {
	path: string; // the keyword of path
	uris: Array<vscode.Uri>; // the real paths of the keyword path
	location: string; // the text in document
	paths?: Map<string, Array<vscode.Uri>>; // multi keyword paths
}
