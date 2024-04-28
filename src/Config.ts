import { Place } from './Place';

export class Config {
	static readonly patterns = [
		/Config::[^'"]*(['"])([^'"]*)\1/g,
		/config\([^'"]*(['"])([^'"]*)\1/g
	];

	public getPlace(path: string, line: string, lines = ''): Place {
		const place = new Place({ path: '', paths: new Map, location: '', uris: [] });

		for (const pattern of Config.patterns) {
			const matches = [...line.matchAll(pattern), ...lines.matchAll(pattern)];
			for (const match of matches) {
				if (!match[2].startsWith(path)) {
					continue;
				}
				const split = path.split('.');
				place.path = 'config/' + split[0] + '.php';
				if (2 <= split.length) {
					place.location = "(['\"]{1})" + split[1] + "\\1\\s*=>";
				}
				return place;
			}
		}

		return place;
	}
}
