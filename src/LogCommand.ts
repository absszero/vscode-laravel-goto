import * as vscode from 'vscode';
import { getFileContent, findFiles } from './Workspace';
import path from 'path';
import { Uri } from 'vscode';

export default async function logCommand() {
	// Step 1: Read config/logging.php
	const loggingConfig = await getFileContent('**/config/logging.php');
	if (!loggingConfig) {
		vscode.window.showErrorMessage('Laravel Goto: config/logging.php not found');
		return;
	}

	// Step 2: Parse channels with 'path' property
	const channels = parseLogChannels(loggingConfig);
	if (channels.size === 0) {
		vscode.window.showWarningMessage('Laravel Goto: No log channels with path found');
		return;
	}

	// Step 3: Show channel quick pick
	const channelItems = Array.from(channels, ([name, path]) => ({
		label: name,
		description: path,
		channel: { name, path }
	}));

	const selectedChannel = await vscode.window.showQuickPick(channelItems, {
		placeHolder: 'Select a log channel'
	});

	if (!selectedChannel) {
		return;
	}

	// Step 4: Find log files based on the selected channel's path
	const logFiles = await findLogFiles(selectedChannel.channel.path);
	if (logFiles.length === 0) {
		vscode.window.showWarningMessage('Laravel Goto: No log files found');
		return;
	}

	// Step 5: Show log files quick pick
	const logFileItems = logFiles.map(file => ({
		label: path.basename(file.fsPath),
		description: file.fsPath,
		filePath: file.fsPath
	}));

	const selectedFile = await vscode.window.showQuickPick(logFileItems, {
		placeHolder: 'Select a log file to open'
	});

	if (!selectedFile) {
		return;
	}

	// Step 6: Open the selected log file and scroll to bottom
	const uri = vscode.Uri.file(selectedFile.filePath);
	const document = await vscode.workspace.openTextDocument(uri);
	const lastLine = document.lineCount - 1;
	await vscode.window.showTextDocument(document, {
		selection: new vscode.Range(lastLine, 0, lastLine, 0)
	});
}

/**
 * Parse logging.php config to extract channels with path
 */
export function parseLogChannels(content: string): Map<string, string> {
	const channels: Map<string, string> = new Map();

	// Match channel definitions
	const channelPattern = /['"]([^'"]+)['"]\s*=>\s*\[([^\]]+)/g;
	let match;

	while ((match = channelPattern.exec(content)) !== null) {
		const channelName = match[1];
		const channelConfig = match[2];

		// Check if this channel has a 'path' property
		const pathMatch = channelConfig.match(/['"]path['"]\s*=>\s*([^,]+)/);
		if (!pathMatch) {
			continue; // Skip channels without a path
		}

		const pathValue = pathMatch[1].trim();
		// Remove trailing comma if exists
		channels.set(channelName, pathValue.replace(/,\s*$/, ''));
	}

	return channels;
}

/**
 * Find log files based on the path expression
 */
export async function findLogFiles(pathExpression: string): Promise<Uri[]> {
	// Resolve storage_path() calls
	let resolvedPath = pathExpression;

	// If the path contains variables (e.g., $variable), we cannot resolve it, so we skip
	if (resolvedPath.includes('$')) {
		return [];
	}

	// Handle storage_path('logs/...')
	const storagePathMatch = pathExpression.match(/storage_path\s*\(\s*['"]([^'"]+)/);
	if (!storagePathMatch) {
		return [];
	}

	const relativePath = storagePathMatch[1].slice(0, -4) + '*.log';
	const logs = await findFiles('**/storage/' + relativePath);
	if (logs.length === 0) {
		return [];
	}

	// sort log files by filename (newest first)
	logs.sort((a, b) => a > b ? -1 : 1);

	return logs;
}