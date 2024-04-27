import { Place } from './Place';

export class ClassName {
	static readonly pattern = /([A-Z][\w]+[\\])+[A-Z][\w]+/;

	public getPlace(path: string, line: string, lines = ''): Place {
		const place = new Place({ path: '', paths: new Map, location: '', uris: [] });

		const match = ClassName.pattern.exec(line) ?? ClassName.pattern.exec(lines);

		if (!match) {
			return place;
		}

		// remove double colons from ClassName
		const colons = path.split('::');
		place.path = colons[0];

		if (colons[1]) {
			place.location = '@' + colons[1];
		/**
		 * TODO
		 * 確認轉跳
		 */
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
}
