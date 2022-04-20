import * as vscode from "vscode";
import { PyodideRunner } from "./pyodideRunner";

export class OutputWebview {
  private _outputWebview: vscode.WebviewPanel;
  constructor(private readonly _pyodideRunner: PyodideRunner) {
    this._outputWebview = vscode.window.createWebviewPanel(
      "pyodide.outputWebview", // Identifies the type of the webview. Used internally
      "Pyodide Output", // Title of the panel displayed to the user
      vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
      {
        // Enable scripts in the webview
        enableScripts: true, // Set this to true if you want to enable Javascript.
      }
    );

    this._outputWebview.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "set_mouse_pos": {
          this._pyodideRunner.setMousePos(message.data);
          break;
        }
      }
    });
    this._outputWebview.webview.html = getWebviewContent();
  }

  public async runGraphics(command: string, data: any) {
    this._outputWebview.webview.postMessage({ type: command, data });
  }
}

function getWebviewContent() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Example Webview</title>
</head>
<body>
  <div id="canvas-container"></div>
	<script>
	const vscode = acquireVsCodeApi();
	const canvasStyle = "background-color: white; margin: 20px;"
	const canvasId =  "canvas";
	const canvasContainer = document.getElementById("canvas-container");
	
	window.addEventListener('message', async (event) => {
		const message = event.data;
		const canvas = document.getElementById(canvasId);
		switch (message.type) {
			case 'create_canvas': {
				const {width, height} = message.data;
				const newCanvas = document.createElement("canvas");
				newCanvas.height = height;
				newCanvas.width = width;
				newCanvas.style = canvasStyle;
				newCanvas.id = canvasId
				// newCanvas.onmousemove = (e) => {
				// 	vscode.postMessage({type: 'set_mouse_pos', data: { x: e.offsetX, y: e.offsetY } });
				// }
				// Remove existing children of canvas container
				while (canvasContainer.firstChild) {
					canvasContainer.removeChild(canvasContainer.firstChild);
				}
				canvasContainer.appendChild(newCanvas);
				break; 
			}
			case 'draw_circle': {
				if (!canvas) return;
				const {radius, x, y} = message.data;
				const color = 'blue' // TODO: Generate random color
				const ctx = canvas.getContext('2d');
        ctx.beginPath()
        ctx.fillStyle = color;
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()
				break; 
			}
			case 'draw_many_circles': {
				if (!canvas) return;
				const { circles } = message.data;
				const ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				JSON.parse(circles).map(([radius, x, y]) => {
					const color = 'blue' // TODO: Generate random color
					ctx.beginPath()
					ctx.fillStyle = color;
					ctx.arc(x, y, radius, 0, 2 * Math.PI)
					ctx.fill()
				})
				break; 
			}
			case 'clear': {
				if (!canvas) return;
				const ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
		}
	})
	</script>
</body>
</html>
`;
}
