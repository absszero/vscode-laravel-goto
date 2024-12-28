import * as vscode from 'vscode';
import { Namespace, Block } from './NS';
import { Selection } from "./Selection";
import { Place } from './Place';
import { Middleware } from './Middleware';
import { Console } from './Console';
import { Router } from './Router';
import { Language } from './Language';
import { Blade } from './Blade';
import { Config } from './Config';
import { Inertia } from './Inertia';
import { Livewire } from './Livewire';
import { ClassName } from './ClassName';
import { Attribute } from './Attribute';

export class Finder {
	document: vscode.TextDocument;
	selection: Selection;
	path: string;
	line: string;
	lines: string;

	constructor(document: vscode.TextDocument, selection: Selection) {
		this.document = document;
		this.selection = selection;
		this.path = selection.getPath(document);
		this.line = document.lineAt(selection.start).text;
		this.lines = selection.getLinesAfterDelimiter(document);
	}

	/**
	 * get place by selection
	 * @param selection
	 */
	public async getPlace(): Promise<Place> {
		const places = [
			this.pathHelperPlace.bind(this),
			this.configPlace.bind(this),
			this.langPlace.bind(this),
			this.envPlace.bind(this),
			this.middlewarePlace.bind(this), // before controllerPlace
			this.controllerPlace.bind(this),
			this.staticPlace.bind(this),
			this.inertiaPlace.bind(this),
			this.livewirePlace.bind(this),
			this.componentPlace.bind(this),
			this.commandPlace.bind(this),
			this.filesystemPlace.bind(this),
			this.routePlace.bind(this),
			this.attributePlace.bind(this),
			this.bladePlace.bind(this),
			this.classNamePlace.bind(this),
		];

		let place = new Place({ path: '', paths: new Map ,location: '', uris: [] });
		for(const thePlace of places) {
			place = await thePlace(place, this.document, this.selection);
			place.source = thePlace.name;
			if (place.path) {
				return place;
			}
		}

		return place;
	}

	/**
	* get path helper place
	*/
	pathHelperPlace(place: Place): Place {
		const pattern = /([\w^_]+)_path\(\s*(['"])([^'"]*)\2/;
		const match = pattern.exec(this.line) ?? pattern.exec(this.lines);

		if ((match && match[3] === this.path)) {
			let prefix = match[1] + '/';
			if ('base/' === prefix) {
				prefix = '';
			} else if ('resource/' === prefix) {
				prefix = 'resources/';
			}

			place.path = prefix + this.path;
			return place;
		}

		return place;
	}

	/**
	 * get component place
	 *
	 */
	componentPlace(place: Place): Place {
		const pattern = /<\/?x-([^/\s>]*)/;

		const match = pattern.exec(this.line) ?? pattern.exec(this.lines);
		if (match && this.path.includes(match[1])) {
			const split = match[1].split(':');
			let vendor = 'View/Components/';
			let resVendor = 'views/components/';
			// namespace or vendor
			if (3 === split.length) {
				// it's vendor
				if (split[0] === split[0].toLowerCase()) {
					vendor = split[0] + '/';
					resVendor = split[0] + '/';
				}
			}

			// capitalizeFirstLetter
			const capitalizeFirstLetter = (words: string[]) => {
				words.forEach((word, key) => {
					words[key] = words[key][0].toUpperCase() + words[key].slice(1);
				});

				return words;
			};

			let sections = split[split.length - 1].split('.');
			place.path = resVendor + sections.join('/') + '.blade.php';
			place.paths?.set(resVendor + sections.join('/') + '.blade.php', []);

			sections = capitalizeFirstLetter(sections);
			let filenames = sections[sections.length - 1].split('-');
			filenames = capitalizeFirstLetter(filenames);
			sections[sections.length - 1] = filenames.join('');
			place.paths?.set(vendor + sections.join('/') + '.php', []);

			return place;
		}

		return place;
	}


	/**
	 * get view place
	 *
	 */
	bladePlace(): Place {
		const blade = new Blade;

		return blade.getPlace(this.path, this.line, this.lines);
	}

	/**
	 * get controller place
	 *
	 */
	controllerPlace(place: Place, document: vscode.TextDocument, selection: vscode.Range): Place {
		const blocks = (new Namespace(document)).blocks(selection);
		const controllerNotInPath = (-1 === this.line.indexOf('Controller'));
		if (0 === blocks.length && controllerNotInPath) {
			return place;
		}
		const pattern = /\[\s*(.*::class)\s*,\s*["']([^"']+)/;
		const match = pattern.exec(this.line) ?? pattern.exec(this.lines);
		place.path = this.path;
		if (match) {
			place.path = match[1];
			place.location = match[2];
		}

		place = this.setControllerAction(blocks, place);
		place = this.setControllerNamespace(blocks, place);

		place.path = place.path
			.replace('::class', '')
			.replace(/\\+/g, '/') + '.php';

		return place;
	}

	/**
	 * get config place
	 */
	configPlace(): Place {
		const config = new Config;

		return config.getPlace(this.path, this.line, this.lines);
	}

	/**
	 * get attribute place
	 */
	attributePlace(): Place {
		const attribute = new Attribute;

		return attribute.getPlace(this.path, this.line, this.lines);
	}

	/**
	 * get file system place
	 */
	filesystemPlace(place: Place): Place {
		const pattern = /Storage::disk\(\s*['"]([^'"]+)/;
		const match = pattern.exec(this.line) ?? pattern.exec(this.lines);
		if (match && match[1] === this.path) {
			place.path = 'config/filesystems.php';
			place.location = "(['\"]{1})" + match[1] + "\\1\\s*=>";
			return place;
		}

		return place;
	}


	/**
	 * get language place
	 *
	 */
	async langPlace(place: Place): Promise<Place> {
		const patterns = [
			/__\([^'"]*(['"])([^'"]*)\1/,
			/@lang\([^'"]*(['"])([^'"]*)\1/,
			/trans\([^'"]*(['"])([^'"]*)\1/,
			/trans_choice\([^'"]*(['"])([^'"]*)\1/,
		];

		for (const pattern of patterns) {
			const match = pattern.exec(this.line) ?? pattern.exec(this.lines);
			if (match && match[2] === this.path) {
				return await (new Language()).getPlace(this.path);
			}
		}

		return place;
	}

	/**
	 * get env place
	 */
	envPlace(place: Place): Place {
		const pattern = /env\(\s*(['"])([^'"]*)\1/;
		const match = pattern.exec(this.line) ?? pattern.exec(this.lines);

		if ((match && match[2] === this.path)) {
			place.location = this.path;
			place.path = '.env';
		}

		return place;
	}

	/**
	 * get static place
	 */
	staticPlace(place: Place): Place {
		const split = this.path.split('.');
		const ext = split[split.length - 1].toLocaleLowerCase();

		let extensions: string[] = vscode.workspace.getConfiguration().get('laravelGoto.staticFileExtensions', []);
		extensions = extensions.map(ext => ext.toLowerCase());

		if (-1 !== extensions.indexOf(ext)) {
			let split = this.path.split('/');
			split = split.filter(d => (d !== '..' && d !== '.'));
			place.path = split.join('/');
		}
		return place;
	}

	/**
	 * get Inertia.js place
	 */
	inertiaPlace(): Place {
		const inertia = new Inertia;

		return inertia.getPlace(this.path, this.line, this.lines);
	}

	/**
	 * get Livewire place
	 */
	livewirePlace(): Place {
		const livewire = new Livewire;

		return livewire.getPlace(this.path, this.line, this.lines);
	}

	/**
	 * get namespace place
	 */
	classNamePlace(): Place {
		const className = new ClassName;

		return className.getPlace(this.path, this.line, this.lines);
	}

	/**
	 * get middleware place
	 */
	async middlewarePlace(place: Place): Promise<Place> {
		const patterns = [
			/[m|M]iddleware\(\s*\[?\s*(['"][^'"]+['"]\s*,?\s*)+/,
			/['"]middleware['"]\s*=>\s*\s*\[?\s*(['"][^'"]+['"]\s*,?\s*){1,}\]?/,
		];

		let middlewares;
		for (const pattern of patterns) {
			const match = pattern.exec(this.line) ?? pattern.exec(this.lines);
			if (!match) {
				continue;
			}

			// remove middleware parameters
			const alias = this.path.split(':')[0];
			if (middlewares === undefined) {
				middlewares = await (new Middleware).all();
			}
			const found = middlewares.get(alias);
			if (found) {
				return found;
			}
		}

		return place;
	}

	/**
	 * get command place
	 */
	async commandPlace(place: Place): Promise<Place> {
		const patterns = [
			/Artisan::call\(\s*['"]([^\s'"]+)/,
			/command\(\s*['"]([^\s'"]+)/,
		];

		let commands;
		for (const pattern of patterns) {
			const match = pattern.exec(this.line) ?? pattern.exec(this.lines);
			if (!match) {
				continue;
			}

			const signature = match[1];
			if (commands === undefined) {
				commands = await (new Console).all();
			}
			const found = commands.get(signature);
			if (found) {
				return found;
			}
		}

		return place;
	}


	/**
	 * get route place
	 */
	// eslint-disable-next-line @typescript-eslint/require-await
	async routePlace(place: Place): Promise<Place> {
		const patterns = [
			/route\(\s*['"]([^'"]+)/,
			/['"]route['"]\s*=>\s*(['"])([^'"]+)/
		];

		let routes;
		for (const pattern of patterns) {
			const match = pattern.exec(this.line) ?? pattern.exec(this.lines);
			if (!match) {
				continue;
			}

			if (routes === undefined) {
				routes = (new Router).all();
			}
			const found = routes.get(this.path);
			if (found) {
				return found;
			}
		}

		return place;
	}

	/**
	 * set controller action
	 *
	 * @param place
	 */
	setControllerAction(blocks: Block[], place: Place): Place {
		if (-1 !== place.path.indexOf('@')) {
			const split = place.path.split('@');
			place.path = split[0];
			place.location = '@' + split[1];
		} else if (place.path.endsWith('::class')) {
			const action = Selection.getByDelimiter(this.document, this.selection, "[]");
			if (action) {
				// HiController, 'index' => index
				place.location = '@' + this.document
					.getText(action)
					.split(',')[1]
					.replace(/['"]+/g, '')
					.trim();
			}
		} else if (blocks.length && !blocks[0].isNamespace) { // resource or controller route
			place.path = blocks[0].namespace;
			if (place.path !== this.path) {
				place.location = '@' + this.path;
			}
		}

		return place;
	}

	/**
	 * set controller namespace
	 *
	 * @param   {Place}  place  [place description]
	 *
	 * @return  {Place}         [return description]
	 */
	setControllerNamespace(blocks: Block[], place: Place): Place {
		// group namespace
		const isClass = place.path.endsWith('::class');
		if ('\\' !== place.path[0] || isClass) {
			if ('\\' === place.path[0]) {
				place.path = place.path.substring(1);
			}
			const namespace = Namespace.find(blocks);
			if (namespace) {
				place.path = namespace + '/' + place.path;
			}
		}
		return place;
	}
}
