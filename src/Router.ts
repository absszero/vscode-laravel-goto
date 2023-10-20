import { Place } from './Place';
import * as workspace from './Workspace';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { FileSystemWatcher } from 'vscode';

interface RouteRow {
    name: string;
    action: string;
}

export class Router {
	static routes = new Map;

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
			return;
		}

		const raw = spawnSync('php', [uris[0].fsPath, 'route:list', '--json', '--columns=name,action']);
		if (raw.status !== 0) {
			return;
		}
		try {
			const routeRows: Array<RouteRow> = JSON.parse(raw.stdout);
			routeRows.forEach(route => {
				const [path, action] = route.action.split('@');
				const place: Place = { path: path, location: '@' + action, uris: [] };
				place.path = workspace.class2path(place.path);

				Router.routes.set(route.name, place);
			});
		} catch (e) {
			return;
		}
	}
}