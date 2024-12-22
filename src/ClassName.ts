import { Place } from './Place';

export class ClassName {
	static readonly patterns = [
		/([A-Z][\w]+[\\])+[A-Z][\w]+/,
		/([A-Z][\w]+[/])+[A-Z][\w]+/,
	];

	public getPlace(path: string, line: string, lines = ''): Place {
		const place = new Place({ path: '', paths: new Map, location: '', uris: [] });

		for (const pattern of ClassName.patterns) {
			const match = pattern.exec(line) ?? pattern.exec(lines);
			if (!match) {
				continue;
			}

			// replace slashes with backslashes
			path = path.replace(/\//g, '\\');

			// remove double colons from ClassName
			const colons = path.split('::');
			place.path = colons[0];

			if (colons[1]) {
				place.location = '@' + colons[1];
			}

			if (place.path.startsWith('\\')) {
				place.path = place.path.substring(1);
			}

			if (place.path.startsWith('App\\')) {
				place.path = 'a' + place.path.substring(1);
			}

			place.path += '.php';

			return place;
		}

		return place;
	}
}
