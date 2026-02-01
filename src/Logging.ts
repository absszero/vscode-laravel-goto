import { Place } from './Place';

export class Logging {
	static readonly patterns = [
		/Log::channel[^'"]*['"]([^'"]*)/g,
	];

	static readonly multiChannelPatterns = [
		/Log::stack\(\[(\s*['"][^'"]+['"]\s*[,]?\s*){2,}\]/,
	];

	public getPlace(path: string, line: string, lines = ''): Place {
		const place = new Place({ path: '', paths: new Map, location: '', uris: [] });

		for (const pattern of Logging.patterns) {
			const matches = [...line.matchAll(pattern), ...lines.matchAll(pattern)];
			for (const match of matches) {
				if (match[1] !== path) {
					continue;
				}
				return this.setPlace(place, match[1]);
			}
		}

		for (const pattern of Logging.multiChannelPatterns) {
			if (pattern.exec(line) ?? pattern.exec(lines)) {
				return this.setPlace(place, path);
			}
		}

		return place;
	}

	private setPlace(place: Place, location: string): Place {
		place.path = 'config/logging.php';
		place.location = "(['\"]{1})" + location + "\\1\\s*=>";
		return place;
	}
}
