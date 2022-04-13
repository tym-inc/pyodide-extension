import * as vscode from 'vscode';

export class PyodideRunner {
	private _pyodideWorker: Worker | undefined;
	private _outputChannel: vscode.OutputChannel;
	private _isRunning = false;
	private _startTime = new Date().getTime();
	private _workerScript: string;
	private _firstMessage = true;

	constructor(context: vscode.ExtensionContext) {
		this._workerScript = vscode.Uri.joinPath(context.extensionUri, "pyodide.js").toString();
		this._outputChannel = vscode.window.createOutputChannel('Pyodide', 'pyodide-output');
		vscode.commands.executeCommand('setContext', 'pyodide.isRunning', false);
		this._isRunning = false;
	}

	stop() {
		this._pyodideWorker?.postMessage({
			keyboardInterrupt: true
		});
	}

	private _setupWorker() {
		this._pyodideWorker = new Worker(this._workerScript);
	
		this._pyodideWorker.onmessage = (event) => {
			const { stdout, done, error } = event.data;

			if (stdout !== undefined) {
				if (this._firstMessage && stdout === 'Python initialization complete') {
					this._firstMessage = false;
					return;
				}
				this._outputChannel.show(true);
				this._outputChannel.appendLine(stdout);
			} 
			else if (done) {
				if (!this._isRunning) {
					return;
				}
				vscode.commands.executeCommand('setContext', 'pyodide.isRunning', false);
				this._isRunning = false;
				this._outputChannel.show(true);
				if (error) {
					this._outputChannel.appendLine(error);
				} 
				this._outputChannel.appendLine(`\n[Done] Finished running in ${new Date().getTime() - this._startTime}ms\n`);
				this._pyodideWorker?.terminate();
			}
		};

		this._pyodideWorker.onerror = (event) => {
			// Added additional check to avoid duplicate error printing
			if (!this._isRunning) {
				return;
			}
			vscode.commands.executeCommand('setContext', 'pyodide.isRunning', false);
			this._isRunning = false;
			this._outputChannel.show(true);
			this._outputChannel.appendLine(event.message);
			this._outputChannel.appendLine(`[Done] Finished running in ${new Date().getTime() - this._startTime} ms.\n`);
			this._pyodideWorker?.terminate();
		};
	}

	private _runCode(code: string) {
		this._firstMessage = true;
		this._startTime = new Date().getTime();
		vscode.commands.executeCommand('setContext', 'pyodide.isRunning', true);
		this._isRunning = true;
		return this._pyodideWorker?.postMessage({
			python: code,
		});
	}
	
	async runFile(fileUri: vscode.Uri) {
		const document = await vscode.workspace.openTextDocument(fileUri);
		if (document !== undefined) {
			this._setupWorker();
			await this._loadFiles();
			this._outputChannel.appendLine(`[Running] ${this._getRelativePath(document.uri)}\n`);
			return this._runCode(document.getText());
		}
	}

	private async _loadFiles() {
		const pythonFiles = await vscode.workspace.findFiles(''); // TODO: Only load Python files
		for (const fileUri of pythonFiles) {
			const fileContents = await vscode.workspace.fs.readFile(fileUri);
			
			this._pyodideWorker?.postMessage({
				file: {
					path: this._getRelativePath(fileUri),
					contents: fileContents
				}
			});
		}
	}

	private _getRelativePath(descendant: vscode.Uri, ancestor: vscode.Uri = vscode.workspace.workspaceFolders![0].uri) {
		const ancestorParts = ancestor.path.split('/');
		const descendantParts = descendant.path.split('/');
		if (ancestorParts.length >= descendantParts.length) {
			return undefined;
		}
		for (let i = 0; i < ancestorParts.length; i++) {
			if (ancestorParts[i] !== descendantParts[i]) {
				return undefined;
			}
		}
		return descendantParts.slice(ancestorParts.length).join('/');
	}
}

