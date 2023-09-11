<?php

Route::middleware(['web:1234', 'api']);

Route::middleware('auth:1234');

Route::group(['middleware' => ['auth',]]);

Route::middleware('first', 'second');