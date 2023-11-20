import * as vscode from 'vscode';

export interface Place {
	path: string;
	uris: Array<vscode.Uri>;
	location: string;
	paths?: Map<string, Array<vscode.Uri>>;
}
