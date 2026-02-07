import { Place } from './Place';

export class Helper {
	public getPlace(path: string, line: string, lines = ''): Place {
		const place = new Place({ path: '', paths: new Map, location: '', uris: [] });
		let pattern = /([\w^_]+)_path\(\s*(['"])([^'"]*)\2/;
		let match = pattern.exec(line) ?? pattern.exec(lines);

		if ((match && match[3] === path)) {
			let prefix = match[1] + '/';
			if ('base/' === prefix) {
				prefix = '';
			} else if ('resource/' === prefix) {
				prefix = 'resources/';
			}

			place.path = prefix + path;
			return place;
		}

		pattern = /to_action\(\s*\[([^,]+),\s*['"]([^'"]+)/;
		match = pattern.exec(line) ?? pattern.exec(lines);

		if ((match && match[2] === path)) {
			place.path = match[1]
				.replace('::class', '')
				.replace(/\\+/g, '/') + '.php';
			place.location = '@' + match[2];
		}

		return place;
	}
}
