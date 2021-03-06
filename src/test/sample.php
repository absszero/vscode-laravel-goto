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

__('messages.welcome');

@lang('messages.welcome');

trans('messages.welcome');

trans_choice('messages.apples', 10);

trans('package::messages');

'./../../hello.JS';

config(['app.timezone' => config('app.tz')]);

view('vendor::hello_view');

app_path('User.php');

base_path('vendor');

config_path('app.php');

database_path('UserFactory.php');

public_path('css/app.css');

resource_path('sass/app.scss');

storage_path('logs/laravel.log');

realpath(storage_path('logs/laravel.log'));

Route::get('/', [L8\HelloController::class, 'index']);

Route::get('/', HelloController::class);

Route::group(['namespace' => 'L8'], function () {
    Route::get('/', [\HelloController::class, 'index']);
});