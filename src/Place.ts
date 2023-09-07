import * as vscode from 'vscode';

export interface Place {
	path: string;
	location: string;
	uris: Array<vscode.Uri>;
}
