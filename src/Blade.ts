import { Place } from './Place';

export class Blade {
	static readonly patterns = [
		/\b(?:view|markdown)\b\(\s*(['"])([^'"]*)\1/,
		/[lL]ayout\(\s*(['"])([^'"]*)\1/,
		/\$view\s*=\s*(['"])([^'"]*)\1/,
		/View::exists\(\s*(['"])([^'"]*)\1/,
		/View::composer[^'"]*(['"])([^'"]*)\1/,
		/View::creator[^'"]*(['"])([^'"]*)\1/,
		/\b(?:view|text|html|markdown)\b\s*:\s*(['"])([^'"]*)\1/,
		/view\(\s*['"][^'"]*['"],\s*(['"])([^'"]*)\1/,
		/['"]layout['"]\s*=>\s*(['"])([^'"]*)\1/,
		/@include(If\b)?\(\s*(['"])([^'"]*)\2/,
		/@extends\(\s*(['"])([^'"]*)\1/,
		/@include(When|Unless\b)?\([^'"]+(['"])([^'"]+)/,
		/(resources\/views[^\s'"-]+)/,
	];

	static readonly multiViewsPatterns = [
		/View::first\(\[(\s*['"][^'"]+['"]\s*[,]?\s*){2,}\]/,
		/View::composer\(\[(\s*['"][^'"]+['"]\s*[,]?\s*){2,}\]/,
		/view\(\[(\s*['"][^'"]+['"]\s*[,]?\s*){2,}\]/,
		/@includeFirst\(\[(\s*['"][^'"]+['"]\s*[,]?\s*){2,}\]/,
		/@each\(['"][^'"]+['"]\s*,[^,]+,[^,]+,[^)]+/,
	];

	static readonly fragmentPatterns = [
		/->fragment\(\s*['"]([^'"]+)/,
		/->fragmentIf\(\s*.*,\s*['"]([^'"]+)/
	];

	static readonly multiFragmentsPatterns = [
		/->fragments\(\s*\[(\s*['"][^'"]+['"]\s*[,]?\s*){2,}\s*\]/,
		/->fragmentsIf\(\s*.*,\s*\[(\s*['"][^'"]+['"]\s*[,]?\s*){2,}\s*\]/,
	];

	public getPlace(path: string, line: string, lines = ''): Place {
		let place = new Place({ path: '', paths: new Map, location: '', uris: [] });

		for (const pattern of Blade.patterns) {
			const match = pattern.exec(line) ?? pattern.exec(lines);
			if (match && match[match.length - 1] === path) {
				place = this.transformFilename(path, place);
				return place;
			}
		}

		for (const pattern of Blade.multiViewsPatterns) {
			if (pattern.exec(line) ?? pattern.exec(lines)) {
				place = this.transformFilename(path, place);
				return place;
			}
		}

		for (const fragmentPattern of Blade.fragmentPatterns) {
			const fragmentMatch = fragmentPattern.exec(lines) ?? fragmentPattern.exec(line);
			if (!fragmentMatch) {
				continue;
			}

			for (const pattern of Blade.patterns) {
				const match = pattern.exec(fragmentMatch.input);
				if (match) {
					place = this.transformFilename(match[match.length - 1], place);
					place.location = `fragment\\(\\s*['"]${path}['"]\\s*\\)`;
					return place;
				}
			}
		}

		for (const fragmentPattern of Blade.multiFragmentsPatterns) {
			const fragmentMatch = fragmentPattern.exec(lines) ?? fragmentPattern.exec(line);
			if (!fragmentMatch) {
				continue;
			}

			for (const pattern of Blade.patterns) {
				const match = pattern.exec(fragmentMatch.input);
				if (match) {
					place = this.transformFilename(match[match.length - 1], place);
					place.location = `fragment\\(\\s*['"]${path}['"]\\s*\\)`;
					return place;
				}
			}
		}

		return place;
	}

	/**
	 *
	 * @param path
	 * @param place
	 * @returns Place
	 */
	protected transformFilename(path: string, place: Place): Place
	{
		const split = path.split(':');
		let vendor = '';
		// namespace or vendor
		if (3 === split.length) {
			// it's vendor
			if (split[0] === split[0].toLowerCase()) {
				vendor = split[0] + '/';
			}
		}

		place.path = split[split.length - 1];
		place.path = vendor + place.path.replace(/\./g, '/');
		if (place.path.endsWith('/blade/php')) {
			place.path = place.path.slice(0, place.path.length - '/blade/php'.length);
		}
		place.path += '.blade.php';

		return place;
	}
}
