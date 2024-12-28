import { Place } from './Place';

export class Livewire {
	static readonly patterns = [
		/livewire:([^\s/>]+)/,
		/@livewire\s*\(\s*['"]([^"']+)/,
	];

	public getPlace(path: string, line: string, lines = ''): Place {
		const place = new Place({ path: '', paths: new Map, location: '', uris: [] });

		for (const pattern of Livewire.patterns) {
			const match = pattern.exec(line) ?? pattern.exec(lines);
			if (null === match) {
				continue;
			}

			if ((match && path.includes(match[1]))) {
				place.path = this.snakeToCamel(match[1]);
				place.path = place.path.charAt(0).toUpperCase() + place.path.slice(1) + '.php';
				return place;
			}
		}

		return place;
	}

	public snakeToCamel(str: string) {
		return str.toLowerCase()
			.replace(/([-_.][a-z])/g, group => group
			.toUpperCase()
			.replace('-', '')
			.replace('_', '')
			.replace('.', '/')
		);
	}
}
