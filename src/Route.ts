import { Place } from './Place';
import { findFiles, class2path } from './Workspace';
import { join } from 'path';
import { spawnSync } from 'child_process';

interface RouteRow {
    name: string;
    action: string;
}

export class Route {
	routes: string | undefined;
/**
 * [export description]
 *
 * @return  {Promise<Map<string, Place>>}              [return description]
 */
	public async all(): Promise<Map<string, Place>> {
		const routes = new Map();

		const uris = await findFiles(join('**', 'artisan'), 1);
		if (uris.length === 0) {
			return routes;
		}

		const raw = spawnSync('php', [uris[0].path, 'route:list', '--json', '--columns=name,action']);
		if (raw.status !== 0) {
			return routes;
		}
		try {
			const routeRows: Array<RouteRow> = JSON.parse(raw.stdout);
			routeRows.forEach(route => {
				const [path, action] = route.action.split('@');
				const place: Place = { path: path, location: action, uris: [] };
				place.path = class2path(place.path);

				routes.set(route.name, place);
			});
		} catch (e) {
			return routes;
		}

		return routes;
	}
}