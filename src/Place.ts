import * as vscode from 'vscode';

export interface Place {
	path: string;
	paths?: Map<string, Array<vscode.Uri>>;
	location: string;
	uris: Array<vscode.Uri>;
}
