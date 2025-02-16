import { QuickPickItem } from 'vscode';
import { Place } from './Place';
import { IRouteRow } from './IRouteRow';

export class RouteItem implements QuickPickItem {

	label: string;
  description?: string | undefined;
	detail: string;
  place: Place;

	constructor(public route: IRouteRow, public thePlace: Place) {
    this.label = route.uri;
    this.description = route.method;
    this.detail = route.action;
    this.place = thePlace;
	}
}