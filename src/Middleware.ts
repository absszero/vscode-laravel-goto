import { Place } from './Place';
import { class2path, getFileContent } from './Workspace';
import { warn } from './Logging';


export class Middleware {
	httpKernel: string | undefined;
/**
 * [export description]
 *
 * @return  {Promise<Map<string, Place>>}              [return description]
 */
	public async all(): Promise<Map<string, Place>> {
		const middlewares = new Map();

		if (this.httpKernel === undefined) {
			this.httpKernel = await getFileContent('**/Http/Kernel.php');
		}
		warn('middleware', 'http kernel found');

		if (!this.httpKernel) {
			return middlewares;
		}

		const classnames = this.collectClassNames(this.httpKernel);

		// Before Laravel 10, middlewareAliases was called routeMiddleware. They work the exact same way.
		const aliasPattern = /(\$\bmiddlewareAliases\b|\$\brouteMiddleware\b)\s*=\s*\[([^;]+)/m;

		const matchBlock = aliasPattern.exec(this.httpKernel);
		if (!matchBlock) {
			return middlewares;
		}

		let match;
		const pattern = /['"]([^'"]+)['"]\s*=>\s*([^,\]]+)/g;
		while ((match = pattern.exec(matchBlock[2])) !== null) {
			if (match.index === pattern.lastIndex) {
				pattern.lastIndex++;
			}

			let className = match[2].replace('::class', '').trim();
			let place = new Place({ path: className, location: '', uris: [] });
			const found = classnames.get(place.path);
			if (found) {
				place.path = found;
			}
			place.path = class2path(place.path);

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
	private collectClassNames(content: string) : Map<string, string> {
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
}
