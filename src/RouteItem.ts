import { QuickPickItem, QuickPickItemKind } from 'vscode';
import { Place } from './Place';
import { IRouteRow } from './IRouteRow';

export class RouteItem implements QuickPickItem {

	label: string;
  description?: string;
	detail?: string;
  place?: Place;
  controller: string;
  kind?: QuickPickItemKind;

	constructor(public route : IRouteRow | undefined = undefined, public thePlace: Place | undefined = undefined) {
    this.label = '';
    this.controller = '';
    if (route) {
      this.label = route.uri;
      this.description = route.method;
      this.detail = route.action;
      this.controller = route.action.split('@')[0];
    }
    this.place = thePlace;
    this.kind = QuickPickItemKind.Default;
	}
}