import { Uri } from 'vscode';
import { Place } from './Place';
import { getFileContent, findFiles, class2path } from './Workspace';
import { join, basename } from 'path';

export class Console {
	static kernelFilename = 'Console/Kernel.php';

	consoleKernel: string = '';
	/**
	 * get all command places
	 *
	 * @return  {Promise<Map<string, Place>>}              [return description]
	 */
	public async all(): Promise<Map<string, Place>> {
		let commands: Map<string, Place> = new Map;
		const uris = await findFiles(join('**', Console.kernelFilename), 1);
		if (uris.length === 0) {
			return commands;
		}

		this.consoleKernel = await getFileContent(uris[0]);
		if (!this.consoleKernel) {
			return commands;
		}

		const files = await this.collectFiles();
		commands = await this.collectFileCmds(files);

		const cmds = await this.collectRegisteredCmds();
		cmds.forEach((value, key) => commands.set(key, value));

		return commands;
	}

	/**
	 * collect files from $this->load(__DIR__.'YOUR_COMMANDS')
	 *
	 * @return  {Promise<Map><string>}           [return description]
	 */
	private async collectFiles() : Promise<Map<string, Uri>> {
		const files = new Map;
		const cmdFnPattern = /function commands\([^\)]*[^{]+([^}]+)/m;
		let match;
		match = cmdFnPattern.exec(this.consoleKernel);
		if (!match) {
			return files;
		}

		const pattern = /\$this->load\(\s*__DIR__\.['"]([^'"]+)/g;
		while ((match = pattern.exec(match[1])) !== null) {
			if (match.index === pattern.lastIndex) {
				pattern.lastIndex++;
			}

			const dir = join('**', 'Console', match[1], '**/*.php');
			const uris = await findFiles(dir, 999);
			for (const uri of uris) {
				files.set(uri.path, uri);
			}
		}

		return files;
	}

	/**
	 * [getCommandSignature description]
	 *
	 * @param   {string}  content  [content description]
	 *
	 * @return  {string}           [return description]
	 */
	private getCommandSignature(content: string) : string {
		const pattern = /\$signature\s*=\s*['"]([^\s'"]+)/;
		const match = pattern.exec(content);
		if (match) {
			return match[1];
		}

		return '';
	}

	/**
	 * collect command signatures from command files
	 *
	 * @param   {Map<string, Uri>}    files  [files description]
	 *
	 * @return  {Place}                      [return description]
	 */
	private async collectFileCmds(files: Map<string, Uri>): Promise<Map<string, Place>> {
		let commands = new Map;
		for (const uri of files.values()) {
			const content = await getFileContent(uri);
			const signature = this.getCommandSignature(content);
			if (signature) {
				const place = new Place({ path: basename(uri.path), location: '', uris: [uri] });
				commands.set(signature, place);
			}
		}

		return commands;
	}

	/**
	 * collect registered commands
	 *
	 * @return  {Promise<Map><string>}           [return description]
	 */
	private async collectRegisteredCmds(): Promise<Map<string, Place>> {
		let commands = new Map;
		const cmdAttrPattern = /\$commands\s*=\s*\[([^\]]+)/m;
		let match = cmdAttrPattern.exec(this.consoleKernel);
		if (!match) {
			return commands;
		}

		const classes = match[1].split('\n');
		for (const className of classes) {
			let filename = class2path(className);

			if (filename === '.php') {
				continue;
			}
			const uris = await findFiles(join('**', filename), 1);
			if (uris.length === 0) {
				continue;
			}
			const content = await getFileContent(uris[0]);
			const signature = this.getCommandSignature(content);
			if (signature) {
				const place = new Place({ path: filename, location: '', uris: [] });
				commands.set(signature, place);
			}
		}

		return commands;
	}
}