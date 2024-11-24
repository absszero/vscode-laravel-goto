import * as assert from 'assert';
import { Inertia } from '../../Inertia';

suite('inertia Test Suite', () => {
	const inertia = new Inertia;

	test('inertia.js function', () => {
		let place = inertia.getPlace('About/AboutComponent', 'inertia("About/AboutComponent");');
		assert.strictEqual(place.path, "About/AboutComponent");

		place = inertia.getPlace('About/AboutComponent', 'inertia(component: "About/AboutComponent");');
		assert.strictEqual(place.path, "About/AboutComponent");
	});

	test('inertia.js render', () => {
		let place = inertia.getPlace('About/AboutComponent', 'Inertia::render("About/AboutComponent");');
		assert.strictEqual(place.path, "About/AboutComponent");

		place = inertia.getPlace('About/AboutComponent', 'Inertia::render(component: "About/AboutComponent");');
		assert.strictEqual(place.path, "About/AboutComponent");
	});

	test('inertia.js route', () => {
		let place = inertia.getPlace('About/AboutComponent', 'Route::inertia("/about", "About/AboutComponent");');
		assert.strictEqual(place.path, "About/AboutComponent");

		place = inertia.getPlace('About/AboutComponent', 'Route::inertia("/about", component: "About/AboutComponent");');
		assert.strictEqual(place.path, "About/AboutComponent");
	});
});
