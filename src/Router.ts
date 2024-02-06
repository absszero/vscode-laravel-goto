import { Place } from './Place';
import * as workspace from './Workspace';
import { join } from 'path';
import { FileSystemWatcher } from 'vscode';
import { warn, error } from './Logging';

interface RouteRow {
    name: string;
    action: string;
}

export class Router {
	static routes = new Map<string, Place>;

	/**
	 * [export description]
	 *
	 * @return  {Map<string, Place>}              [return description]
	 */
	public all(): Map<string, Place> {
		return Router.routes;
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
		Router.routes = new Map;

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
				const place = new Place({ path: path, location: '@' + action, uris: [] });
				place.path = workspace.class2path(place.path);

				Router.routes.set(route.name, place);
			});
		} catch (err) {
				if (err instanceof Error) {
					error('collect routes failed', err.message);
				}
			return;
		}
	}
}