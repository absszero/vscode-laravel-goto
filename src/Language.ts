import { Place } from './Place';
import * as workspace from './Workspace';
import { basename, dirname } from 'path';
import { info, warn } from './Logging';
import { readdir, stat } from 'fs/promises';
import { Uri } from 'vscode';

export class Language {
    static filename = (vendor: string, file: string) => `lang/${vendor}${file}.php`;
    static langFilename = (vendor: string, lang: string, file: string) => `${vendor}${lang}/${file}.php`;
	base: string | undefined;
	langs: string[] = [];

	public async getPlace(path: string): Promise<Place> {
		const place = new Place({
			path: '',
			location: '',
			uris: [],
			paths: new Map
		});

		if (undefined === this.base) {
			await this.init();
		}
		if ('' === this.base) {
			return place;
		}

		const split = path.split(':');
		const vendor = (3 === split.length) ? `vendor/${split[0]}/` : '';
		const keys = split[split.length - 1].split('.');

		place.path = Language.filename(vendor, keys[0]);
		if (2 <= keys.length) {
			place.location = "(['\"]{1})" + keys[1] + "\\1\\s*=>";
		}


		place.paths = new Map;
		for (const lang of this.langs) {
			const path = Language.langFilename(vendor, lang, keys[0]);
			const uris = [];
			const uri = Uri.parse(this.base + '/' + path);
			try {
				if ((await stat(uri.fsPath)).isFile()) {
					uris.push(uri);
				}
			} catch (error) {
				warn('lang file not found', uri.fsPath);
			}

			place.paths.set('lang/' + path, uris);
		}

		return place;
	}

	/**
	 * init
	 */
	public async init() {
		this.base = '';
		const files = await workspace.findFiles('**/resources/lang/**', 1);
		if (files.length === 0) {
			return;
		}

		this.base = dirname(dirname(files[0].fsPath));
		info('lang base', this.base);

		(await readdir(this.base)).forEach((foloder) => {
			this.langs.push(basename(foloder));
		});
		info('lang langs', ...this.langs);
	}
}