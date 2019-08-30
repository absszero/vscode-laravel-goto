import * as vscode from 'vscode';

let editor: vscode.TextEditor;
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerTextEditorCommand('extension.vscode-laravel-goto',
	(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
		editor = textEditor;
		let selection = getSelection(editor.selection);
		let path = getPath(selection);
		search(path);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function search(path: string)
{
	if (isController(path)) {
		path = path + '.php';
	} else {
		path = path.replace(/\./g, '/') + '.blade.php';
	}

	vscode.commands.executeCommand('workbench.action.quickOpen', path);
}

function getPath(selection: vscode.Range)
{
	let path = editor.document.getText(selection);
	if (isController(path))
	{
		// namespace = self.get_namespace(selection)
		// if namespace:
		path = path;
	} else {
		let splited = path.split(':');
        path = splited[splited.length - 1];
	}

	return path
}

function isController(path: string)
{
	return (-1 !== path.indexOf('@') || -1 !== path.indexOf('Controller'));
}

function getSelection(selected: vscode.Selection) {
	let start = selected.start;
	let end = selected.end;

	if (!start.isEqual(end)) {
		return new vscode.Range(start, end);
	}

	const line = editor.document.lineAt(start);
	const DELIMITERS = "\"'"
	while (start.isAfter(line.range.start)) {
		let next = start.with({character: start.character - 1})
		let char = editor.document.getText(new vscode.Range(next, start));
		if (-1 !== DELIMITERS.indexOf(char)) {
			break;
		}
		start = next;
	}
	while (end.isBefore(line.range.end)) {
		let next = end.with({character: end.character + 1})
		let char = editor.document.getText(new vscode.Range(end, next));
		if (-1 !== DELIMITERS.indexOf(char)) {
			break;
		}
		end = next;
	}

	return new vscode.Range(start, end);
}

