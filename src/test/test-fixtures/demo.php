<?php
Route::get('/', 'HelloController@index');

view('hello_view');

config('app.timezone');

trans('messages.welcome');

env('APP_DEBUG', false);