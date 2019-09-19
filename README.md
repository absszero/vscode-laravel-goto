# Laravel Goto for VS Code

[![Build Status](https://travis-ci.com/absszero/vscode-laravel-goto.svg?branch=master)](https://travis-ci.com/absszero/vscode-laravel-goto)

Goto various Laravel files by `Alt`+`;`

![](example.gif)

## Features

- Open Blade Template files *(EX. hello.blade.php)*
- Open Controller and highlight method *(EX. \Namespace\Controller.php@Method)*
- Open Static files (*EX. hello.js*)
- Open Config files and highlight option (EX. config\app.php)
- Open .env and highlight option 
- Default supported static file extensions
    - js
    - ts
    - jsx
    - vue
    - css
    - scss
    - sass
    - less
    - styl
    - htm
    - html
    - xhtml
    - xml
    - log

## Requirements

#### Enable `Go to Symbol in File` for PHP

To enable moving to Method directly after a Controller is opened. Make sure one of these extensions is installed.

- https://marketplace.visualstudio.com/items?itemName=linyang95.php-symbols

- https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-intellisense

- https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client


## Usage

- Move your cursor on a text, Press `Alt`+`;` to run the command.
- Or Select a text, `Right-Click` to open content menu, Choose `Laravel Goto`.
