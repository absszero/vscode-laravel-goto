import { Place } from './Place';

export class Inertia {
	static readonly patterns = [
		/Route::inertia\s*\([^,]+,\s*['"]([^'"]+)/,
		/Route::inertia\s*\([^,]+,\s*component\s*:\s*['"]([^'"]+)/,
		/Inertia::render\s*\(\s*['"]([^'"]+)/,
		/Inertia::render\s*\(\s*component\s*:\s*['"]([^'"]+)/,
		/inertia\s*\(\s*['"]([^'"]+)/,
		/inertia\s*\(\s*component\s*:\s*['"]([^'"]+)/,
	];

	public getPlace(path: string, line: string, lines = ''): Place {
		const place = new Place({ path: '', paths: new Map, location: '', uris: [] });

		for (const pattern of Inertia.patterns) {
			const match = pattern.exec(line) ?? pattern.exec(lines);
			if ((match && match[1] === path)) {
				place.path = path;
				return place;
			}
		}
		return place;
	}
}
