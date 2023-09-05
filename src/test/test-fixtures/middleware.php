<?php

Route::get('/profile', function () {
    // ...
})->middleware(Authenticate::class);

Route::get('/', function () {
    // ...
})->middleware(['web', 'api']);

Route::get('/profile', function () {
    // ...
})->middleware('auth');

Route::middleware([EnsureTokenIsValid::class]);

Route::get('/profile', function () {
    // ...
})->withoutMiddleware([EnsureTokenIsValid::class]);

Route::withoutMiddleware([EnsureTokenIsValid::class]);

Route::put('/post/{id}', function (string $id) {
    // ...
})->middleware('role:editor');

$this->middleware('log')

$this->middleware('subscribed')