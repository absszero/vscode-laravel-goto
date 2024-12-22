import * as assert from 'assert';
import { Livewire } from '../../Livewire';

suite('livewire Test Suite', () => {
	const livewire = new Livewire;

	test('blade tag', () => {
		const place = livewire.getPlace('nav.show-post', '<livewire:nav.show-post>');
		assert.strictEqual(place.path, "Nav/ShowPost.php");
	});

	test('blade directive', () => {
		const place = livewire.getPlace('nav.show-post', '@livewire("nav.show-post")');
		assert.strictEqual(place.path, "Nav/ShowPost.php");
	});
});
