// webworker.js

// Setup your project to serve `py-worker.js`. You should also serve
// `pyodide.js`, and all its associated `.asm.js`, `.data`, `.json`,
// and `.wasm` files as well:
importScripts("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js");

async function setPyodide() {
  self.pyodide = await loadPyodide({
    stdout: (stdout) =>  self.postMessage({ stdout }),
    stderr: (stderr) =>  self.postMessage({ stderr })
  });
  self.interruptBuffer = new Uint8Array(new ArrayBuffer(1));
  self.pyodide.setInterruptBuffer(self.interruptBuffer);
}

let pyodideReadyPromise = setPyodide();

self.onmessage = async (event) => {
  // make sure loading is done
  await pyodideReadyPromise;

  const { python, file, keyboardInterrupt } = event.data;


  if (keyboardInterrupt) {
    self.interruptBuffer[0] = 2;
  }
  // the message we received was python code
  else if (python !== undefined) {
      try {
        self.interruptBuffer[0] = 0;
        await self.pyodide.loadPackagesFromImports(python);
        let results = await self.pyodide.runPythonAsync(python);
        self.postMessage({ results, done: true });
      } catch (error) {
        self.postMessage({ error: error.message, done: true });
      }
    // the message we received was to create a file in the virtual fs
  } else if (file && file.path && file.contents) {
    
    await mkdir(file.path);

    try {
      await self.pyodide.FS.writeFile(file.path, file.contents);
    } catch (error) {
      self.postMessage({ error: 'Error writing file ' + file.path });
    }
  }
};

// makes parent directories if necessary for filePath : string
async function mkdir(filePath) {
  const slashIndex = filePath.lastIndexOf('/');
  const dir = filePath.substring(0, slashIndex);
  if (filePath.indexOf('/') !== -1) {
    mkdir(dir);
  }
  if (dir.length > 0) {
    try {
      await self.pyodide.FS.mkdir(dir);
    } catch {}
  }
}