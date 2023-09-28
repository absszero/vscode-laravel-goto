import { Place } from './Place';

/**
 * [export description]
 *
 * @param   {string}  content  [content description]
 *
 * @return  {Map<string, string>}              [return description]
 */
export function parse(content: string): Map<string, Place> {
	const middlewares = new Map();
	const classnames = collectClassNames(content);

	// Before Laravel 10, middlewareAliases was called routeMiddleware. They work the exact same way.
	const aliasPattern = /(\$\bmiddlewareAliases\b|\$\brouteMiddleware\b)\s*=\s*\[([^;]+)/m;

	const matchBlcok = aliasPattern.exec(content);
	if (!matchBlcok) {
		return middlewares;
	}

	let match;
	const pattern = /['"]([^'"]+)['"]\s*=>\s*([^,\]]+)/g;
	while ((match = pattern.exec(matchBlcok[2])) !== null) {
		if (match.index === pattern.lastIndex) {
			pattern.lastIndex++;
		}

		let className = match[2].replace('::class', '').trim();
		let place: Place = { path: className, location: '', uris: [] };
		const found = classnames.get(place.path);
		if (found) {
			place.path = found;
		}

		place.path = place.path.replace(/\\/g, '/') + '.php';
		if ('/' === place.path[0]) {
			place.path = place.path.substring(1);
		}

		// glob pattern is case-sensitive, and default app folder is lowercase.
		if (place.path.startsWith('App/')) {
			place.path = place.path.substring('App/'.length);
		}

		middlewares.set(match[1], place);
	}

	return middlewares;
}

/**
 * collect class names
 *
 * @param   {strin}  content  [content description]
 *
 * @return  {Map<string, string>}              [return description]
 */
function collectClassNames(content: string) : Map<string, string> {
	const classnames = new Map();
	const pattern = /use\s+([^\s]+)\s+as+\s+([^;]+)/g;
	let match;
	while ((match = pattern.exec(content)) !== null) {
		if (match.index === pattern.lastIndex) {
			pattern.lastIndex++;
		}
		classnames.set(match[2], match[1].trim());
	}
	return classnames;
}
