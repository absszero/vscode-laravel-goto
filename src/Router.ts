import { Place } from './Place';
import * as workspace from './Workspace';
import { join } from 'path';
import { FileSystemWatcher } from 'vscode';
import { LogManager } from './LogManager';
import { IRouteRow } from './IRouteRow';
import { RouteItem } from './RouteItem';

export class Router {
	static namedRoutes = new Map<string, Place>;
	private logManager: LogManager = new LogManager('Router');
	static uriRoutes = new Set<RouteItem>();
	static isUpdating = false;

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
	 * @return  {Set<RouteItem>}              [return description]
	 */
	public uris(): Set<RouteItem> {
		return Router.uriRoutes;
	}

	public watch() : FileSystemWatcher {
		const watcher = workspace.createFileSystemWatcher('**/routes/**/*.php');
		const callback = async () => await (new Router).update();
		watcher.onDidCreate(callback);
		watcher.onDidChange(callback);
		watcher.onDidDelete(callback);

		return watcher;
	}

	public async update() {
		this.logManager.info('isUpdating', Router.isUpdating.toString());
		if (Router.isUpdating) {
			return;
		}
		Router.isUpdating = true;

		Router.namedRoutes = new Map;
		Router.uriRoutes = new Set;

		const uris = await workspace.findFiles(join('**', 'artisan'), 1);
		if (uris.length === 0) {
			this.logManager.warn('artisan not found');
			Router.isUpdating = false;
			return;
		}

		const args = [uris[0].fsPath, 'route:list', '--json'];
		this.logManager.info('artisan command', 'php ' + args.join(' '));
		const raw = workspace.spawnSync('php', args);
		if (raw.status !== 0) {
			this.logManager.error('route:list failed', raw.stdout.toString());
			Router.isUpdating = false;
			return;
		}
		try {
			const routeRows = JSON.parse(raw.stdout.toString()) as IRouteRow[];
			this.logManager.info('route count', routeRows.length.toString());
			routeRows.forEach(route => {
				const [path, action] = route.action.split('@');
				// Closure routes do not have a controller
				if ('Closure' === path) {
					return;
				}

				const place = new Place({ path: path, location: action ? '@' + action : '', uris: [] });
				place.path = workspace.class2path(place.path);

				Router.namedRoutes.set(route.name, place);
				Router.uriRoutes.add(new RouteItem(route, place));
			});
		} catch (err) {
				if (err instanceof Error) {
					this.logManager.error('collect routes failed', err.message);
				}
			return;
		} finally {
			Router.isUpdating = false;
		}
	}
}