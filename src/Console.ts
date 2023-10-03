import { Uri } from 'vscode';
import { Place } from './Place';
import { getFileContent, findFiles } from './Workspace';
import { join, basename } from 'path';

export class Console {
	static kernelFilename = 'Console/Kernel.php';

	consoleKernel: string | undefined;
	/**
	 * get all command places
	 *
	 * @return  {Promise<Map<string, Place>>}              [return description]
	 */
	public async all(): Promise<Map<string, Place>> {
		let commands = new Map();
		const uris = await findFiles(join('**', Console.kernelFilename), 1);
		if (uris.length === 0) {
			return commands;
		}

		this.consoleKernel = await getFileContent(uris[0]);
		if (!this.consoleKernel) {
			return commands;
		}

		const cmdFnPattern = /function commands\([^\)]*[^{]+([^}]+)/m;
		const match = cmdFnPattern.exec(this.consoleKernel);
		if (match) {
			const files = await this.collectFiles(match[1]);
			commands = await this.collectCommands(files);
		}

		return commands;
	}

	/**
	 * collect files from $this->load(__DIR__.'YOUR_COMMANDS')
	 *
	 * @param   {string<Map><string>}   content  [content description]
	 *
	 * @return  {Promise<Map><string>}           [return description]
	 */
	private async collectFiles(content: string) : Promise<Map<string, Uri>> {
		const pattern = /\$this->load\(\s*__DIR__\.['"]([^'"]+)/g;
		const files = new Map;

		let match;
		while ((match = pattern.exec(content)) !== null) {
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
	 * collect command signatures from command files
	 *
	 * @param   {Map<string, Uri>}    files  [files description]
	 *
	 * @return  {Place}                      [return description]
	 */
	private async collectCommands(files: Map<string, Uri>): Promise<Map<string, Place>> {
		let commands = new Map;
		const pattern = /\$signature\s*=\s*['"]([^\s'"]+)/;
		let match;
		for (const uri of files.values()) {
			const content = await getFileContent(uri);
			match = pattern.exec(content);
			if (match) {
				const place: Place = { path: basename(uri.path), location: '', uris: [uri] };
				commands.set(match[1], place);
			}
		}

		return commands;
	}
}