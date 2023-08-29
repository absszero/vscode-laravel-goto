# Laravel Goto for VS Code

![actions/workflows/test.yaml](https://github.com/absszero/vscode-laravel-goto/workflows/.github/workflows/test.yaml/badge.svg)

Goto various Laravel files by hover it.

![](example.gif)

## Features

- Go to Blade Template files (EX. hello.blade.php)
- Go to Blade Component files (EX. &lt;x-alert&gt;)
- Go to Controller and highlight method (EX. \Namespace\Controller.php@Method)
- Go to Static files (EX. hello.js)
- Go to Config files and highlight option (EX. config/app.php)
- Go to Language files (EX. resources/lang/en/messages.php )
- Go to .env and highlight option
- Go to Inertia.js components (EX. Inertia::render('MyComponent');)
- Go to Livewire classes (EX. &lt;livewire:nav.show-post /&gt; => Nav/ShowPost.php )

- Go to paths by path helers, EX:
  - app_path('User.php');
  - base_path('vendor');
  - config_path('app.php');
  - database_path('UserFactory.php');
  - public_path('css/app.css');
  - resource_path('sass/app.scss');
  - storage_path('logs/laravel.log');

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

- Move cursor on a text, and click the hover content, or press `Alt`+`;` to run the command.
- Or Select a text, `Right-Click` to open content menu, Choose `Laravel Goto`.
