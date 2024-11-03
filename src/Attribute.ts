import { Place } from './Place';

export class Attribute {
	static readonly patterns = [
		/#\[([^(]+)\('([^"']+)/g,
	];

	static readonly files = new Map([
		['Auth', 'config/auth.php'],
		['Cache', 'config/cache.php'],
		['DB', 'config/database.php'],
		['Log', 'config/logging.php'],
		['Storage', 'config/filesystems.php'],
	]);

	public getPlace(path: string, line: string, lines = ''): Place {
		const place = new Place({ path: '', paths: new Map, location: '', uris: [] });

		for (const pattern of Attribute.patterns) {
			const matches = [...line.matchAll(pattern), ...lines.matchAll(pattern)];
			for (const match of matches) {
				if (match[2] !== path) {
					continue;
				}

				// Config file
				if ('Config' === match[1]) {
					const split = path.split('.');
					place.path = 'config/' + split[0] + '.php';
					if (2 <= split.length) {
						place.location = `['"]${split[1]}['"]\\s*=>`;
					}
					return place;
				}

				if (!Attribute.files.has(match[1])) {
					continue;
				}
				place.path = Attribute.files.get(match[1]) ?? '';
				place.location = `['"]${path}['"]\\s*=>`;
				return place;
			}
		}

		return place;
	}
}
