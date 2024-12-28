<?php

view('hello_view', ['name' => 'James']);

view('Namespace::hello_view');

view('vendor::hello_view');

View::first(['custom.admin', 'admin'], $data);

View::exists('emails.customer');

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

Config::get('app.timezone.{$var}');

Config::get("app.$var.timezone");

Config::get("app.{$var}.hello");

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

Route::controller(HelloController::class)->group(function () {
    Route::get('/posts/{id}', 'show');
});

Route::controller('HelloController')->group(function () {
    Route::get('/posts/{id}', 'show');
});

<x-vendor::hello />

<x-alert type="error" :message="$message"></x-alert>

<x-forms.input/>

'App\User'

Route::inertia('/about', 'About/AboutComponent');

Route::inertia('/about', component: 'About/AboutComponent');

return Inertia::render('About/AboutComponent');

return inertia('About/AboutComponent');

@livewire('nav.show-post')

<livewire:nav.show-post />

$view = 'hello.world'

layout('layouts.app')

"{{-- resources/views/components/layout --}}"

'{{-- "Livewire/Admin/Elevator/Elevator" --}}'

view: 'emails.test',

Route::view('/', 'pages.public.index');

'layout' => 'layouts.app',

@includeIf('view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])

@includeFirst(['custom.admin', 'admin'], ['status' => 'complete'])

@each('view.name', $jobs, 'job', 'view.empty')

@extends('layouts.app')

Artisan::call('app:say-hello');

command('app:say-hello');

command('app:say-goodbye');

Storage::disk('local')->put('example.txt', 'Contents');

config(['app.timezone' => config('app.tz')]);

config('app.{$var}');

return view('hello_view', ['users' => $users])->fragment('user-list');

view('dashboard', ['users' => $users])->fragments(['user-list', 'comment-list']);

view('dashboard', ['users' => $users])
->fragmentsIf($request->hasHeader('HX-Request'), ['user-list', 'comment-list']);
