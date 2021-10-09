import * as vscode from 'vscode';
import { Namespace } from './namespace';
import { getSelection } from './extension';

class Place {
	path: string;
	location: string;

	constructor() {
		this.path = "";
		this.location = "";
	}
}

/**
 * get place by selection
 * @param selection
 */
 export function getPlace(editor: vscode.TextEditor, selection: vscode.Range) : { path: string; location: string }
 {
     let location = "";
     let path = editor.document.getText(selection).trim();
     const line = editor.document.getText(editor.document.lineAt(selection.start).range);

     let places = [
         pathHelperPlace,
         controllerPlace,
         configPlace,
         langPlace,
         envPlace,
         staticPlace,
     ];

     for (let i = 0; i < places.length; i++) {
         let place = places[i](editor, selection, path, line);
         if (place.path) {
             return place;
         }
     }

     let place = viewPlace(editor, selection, path, line);
     return place;
 }

 /**
 * get path helper place
 * @param editor
 * @param selection
 * @param path
 * @param line
 */
function pathHelperPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	const pattern = /([\w^_]+)_path\(\s*(['"])([^'"]*)\2/;
	const match = pattern.exec(line);
	let place = new Place;

	if ((Boolean)(match && match[3] === path)) {
		let prefix = match![1] + '/';
		if ('base/' === prefix) {
			prefix = '';
		} else if ('resource/' === prefix) {
			prefix = 'resources/';
		}

		place.path = prefix + path;
	}

	return place;
}

/**
 * get view place
 * @param editor
 * @param selection
 * @param path
 * @param line
 */
function viewPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	let split = path.split(':');
	let vendor = '';
	// namespace or vendor
	if (3 === split.length) {
		// it's vendor
		if (split[0] === split[0].toLowerCase()) {
			vendor = split[0] + '/';
		}
	}

	let place = new Place;
	place.path = split[split.length - 1];
	place.path = vendor + place.path.replace(/\./g, '/') + '.blade.php';

	return place;
}

/**
 * get controller place
 * @param editor
 * @param selection
 * @param path
 * @param line
 */
 function controllerPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	let place = new Place;
	if (-1 === path.indexOf('Controller')) {
		return place;
	}
	place.path = path;

	place = setControllerAction(editor, selection, place);
	place = setControllerNamespace(editor, selection, place);

	place.path = place.path
		.replace('::class', '')
		.replace(/\\/g, '/') + '.php';

	return place;
}

/**
 * get config place
 * @param editor
 * @param selection
 * @param path
 * @param line
 */
function configPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	const patterns = [
		/Config::[^'"]*(['"])([^'"]*)\1/,
		/config\([^'"]*(['"])([^'"]*)\1/g
	];

	let place = new Place;

	for (const pattern of patterns) {
		let match;
		do {
			match = pattern.exec(line);
			if (match && match[2] === path) {
				let split = path.split('.');
				place.path = 'config/' + split[0] + '.php';
				if (2 <= split.length) {
					place.location = "(['\"]{1})" + split[1] + "\\1\\s*=>";
				}
				return place;
			}
		} while (match);
	}

	return place;
}
/**
 * get language place
 * @param editor
 * @param selection
 * @param path
 * @param line
 */
function langPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	const patterns = [
		/__\([^'"]*(['"])([^'"]*)\1/,
		/@lang\([^'"]*(['"])([^'"]*)\1/,
		/trans\([^'"]*(['"])([^'"]*)\1/,
		/trans_choice\([^'"]*(['"])([^'"]*)\1/,
	];

	let place = new Place;

	for (const pattern of patterns) {
		let match = pattern.exec(line);
		if (match && match[2] === path) {
			let split = path.split(':');
			let vendor = (3 === split.length) ? `/vendor/${split[0]}` : '';
			let keys = split[split.length - 1].split('.');

			place.path = `resources/lang${vendor}/${keys[0]}.php`;
			if (2 <= keys.length) {
				place.location = "(['\"]{1})" + keys[1] + "\\1\\s*=>";
			}

			return place;
		}
	}

	return place;
}

/**
 * get env place
 * @param editor
 * @param selection
 * @param path
 * @param line
 */
function envPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	const pattern = /env\(\s*(['"])([^'"]*)\1/;
	const match = pattern.exec(line);
	let place = new Place;

	if ((Boolean)(match && match[2] === path)) {
		place.location = path;
		place.path = '.env';
	}

	return place;
}

/**
 * get static place
 * @param editor
 * @param selection
 * @param path
 * @param line
 */
function staticPlace(editor: vscode.TextEditor, selection: vscode.Range, path: string, line: string): Place {
	const split = path.split('.');
	const ext = split[split.length - 1].toLocaleLowerCase();
	let place = new Place;

    let extensions : Array<string> = vscode.workspace.getConfiguration().get('laravelGoto.staticFileExtensions', []);
	extensions = extensions.map(ext => ext.toLowerCase());

	if (-1 !== extensions.indexOf(ext)) {
		let split = path.split('/');
		split = split.filter(d => (d !== '..' && d !== '.'));
		place.path = split.join('/');
	}
	return place;
}

/**
 * set controller action
 *
 * @param editor
 * @param selection
 * @param place
 */
 function setControllerAction(editor: vscode.TextEditor, selection: vscode.Range, place: Place): Place {
	if (-1 !== place.path.indexOf('@')) {
		let split = place.path.split('@');
		place.path = split[0];
		place.location = '@' + split[1];
	} else if (place.path.endsWith('::class')) {
		let action = getSelection(editor, selection, "[]");
		if (action) {

			// HiController, 'index' => index
			place.location = '@' + editor.document
			.getText(action)
			.split(',')[1]
			.replace(/['"]+/g, '')
			.trim();
		}
	}

	return place;
}


/**
 * get controller namespace
 * @param editor
 * @param selection
 * @param place
 */
function setControllerNamespace(editor: vscode.TextEditor, selection: vscode.Range, place: Place): Place {
	// group namespace
	const isClass = place.path.endsWith('::class');
	if ('\\' !== place.path[0] || isClass) {
		if ('\\' === place.path[0]) {
			place.path = place.path.substring(1);
		}
		let namespace = (new Namespace).find(editor.document, selection);
		if (namespace) {
			place.path = namespace + '/' + place.path;
		}
	}
	return place;
}