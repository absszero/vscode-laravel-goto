<?php

Route::middleware(['auth.basic', 'auth:role']);

Route::middleware('auth.basic');

Route::group(['middleware' => ['auth',]]);

Route::middleware('auth', 'auth.basic');