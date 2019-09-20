<?php
view('hello_view');

view('Namespace::hello_view');

Route::get('/', 'HelloController@index');

Route::namespace('58')->group(function () {
    Route::get('/', 'HelloController@index');
});

Route::group(['namespace' => '52'], function () {
    Route::get('/', 'HelloController@index');
});

Route::group(['namespace' => 'Resource'], function () {
    Route::resource('photo', 'HelloController', ['only' => [
        'index', 'show'
    ]]);
});

$router->group(['namespace' => 'Lumen'], function () use ($router) {
    Route::get('/', 'HelloController@index');
});

Route::group(['namespace' => 'Abc'], function () {
    Route::get('/', '\Absolute\HelloController@index');
});

'hello.JS';

Config::get('app.timezone');

Config::set(   'app.timezone', 'UTC');

config('app');

config('app.timezone');

config(     ['app.timezone' => 'UTC']);

env(   'APP_DEBUG', false);