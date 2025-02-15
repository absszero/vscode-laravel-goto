import { Place } from './Place';
import * as workspace from './Workspace';
import { join } from 'path';
import { FileSystemWatcher } from 'vscode';
import { warn, error } from './Logging';

interface RouteRow {
    name: string;
		uri: string;
    action: string;
}

export class Router {
	static namedRoutes = new Map<string, Place>;
	static uriRoutes = new Map<string, Place>;

	/**
	 * [export description]
	 *
	 * @return  {Map<string, Place>}              [return description]
	 */
	public all(): Map<string, Place> {
		return Router.namedRoutes;
	}

	/**
	 * [export description]
	 *
	 * @return  {Map<string, Place>}              [return description]
	 */
	public uris(): Map<string, Place> {
		return Router.uriRoutes;
	}

	public watch() : FileSystemWatcher {
		const watcher = workspace.createFileSystemWatcher('**/routes/*.php');
		const callback = async () => await (new Router).update();
		watcher.onDidCreate(callback);
		watcher.onDidChange(callback);
		watcher.onDidDelete(callback);

		return watcher;
	}

	public async update() {
		Router.namedRoutes = new Map;
		Router.uriRoutes = new Map;

		const uris = await workspace.findFiles(join('**', 'artisan'), 1);
		if (uris.length === 0) {
			warn('artisan not found');
			return;
		}

		const raw = workspace.spawnSync('php', [uris[0].fsPath, 'route:list', '--json']);
		if (raw.status !== 0) {
			error('route:list failed', raw.stdout.toString());
			return;
		}
		try {
			const routeRows = JSON.parse(raw.stdout.toString()) as RouteRow[];
			routeRows.forEach(route => {
				const [path, action] = route.action.split('@');
				// Closure routes do not have a controller
				if ('Closure' === path) {
					return;
				}

				const place = new Place({ path: path, location: action ? '@' + action : '', uris: [] });
				place.path = workspace.class2path(place.path);

				Router.namedRoutes.set(route.name, place);
				Router.uriRoutes.set(route.uri, place);
			});
		} catch (err) {
				if (err instanceof Error) {
					error('collect routes failed', err.message);
				}
			return;
		}
	}
}