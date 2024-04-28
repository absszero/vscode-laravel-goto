import * as vscode from 'vscode';
import { IPlace } from './IPlace';

export class Place implements IPlace {
	path: string;
	uris: vscode.Uri[];
	location: string;
	paths?: Map<string, vscode.Uri[]>;
	locations?: Map<string, string>;
	source?: string;

	constructor(place: IPlace) {
		this.path = place.path;
		this.uris = place.uris;
		this.location = place.location;
		this.paths = place.paths;
	}

	/**
	 * [getUniquePaths description]
	 *
	 * @return  {string[]}[return description]
	 */
	public getUniquePaths(): string[] {
		if (this.paths?.size) {
			const fsPaths: string[] = [];

			for (const [, uris] of this.paths) {
				// if every path has only one uri
				if (1 === uris.length) {
					fsPaths.push(uris[0].fsPath);
				}
			}

			if (fsPaths.length === this.paths.size) {
				return fsPaths;
			}
		}

		return [];
	}
}
