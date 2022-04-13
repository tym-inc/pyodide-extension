# 🐍 Run python files on the web with ZERO setup

Run Python code on VS Code without installing a Python intepreter! 🤯 

This magic is enabled by Pyodide 🪄, a port of CPython to WebAssembly/Emscripten that lets you run Python on the web!

## 🚀 How it works

1. Open a python file
2. Run it by clicking green play button on the top right corner of the editor.
3. See the output!
4. You can also stop the execution of your file by clicking on the red stop button.

## Known Limitations
1. [Certain modules](https://pyodide.org/en/stable/usage/wasm-constraints.html) cannot be loaded on Pyodide due to limitations of WASM. <br/>
Note: You may be able to install certain modules using micropip. Refer to [Pyodide documentation](https://pyodide.org/en/stable/usage/loading-packages.html#micropip) for more information.
2. Python code may be slow to run when there are many imports, as a new web worker is created each time and the modules will be downloaded on each run. This was done to make sure local imports are handled correctly as there is no easy way for Pyodide to refresh local imports. Once the mechanism of this caching is more clear, a more efficient workaround may arise.
3. Support for stdin and visual output is WIP.
4. IntelliSense might be restricted as modules may not be installed on your filesystem.
5. time.sleep is treated as a no-op by [Pyodide](https://github.com/pyodide/pyodide/issues/97)
6. Since your code is being [run inside a top-level await](https://pyodide.org/en/stable/usage/api/js-api.html#pyodide.runPythonAsync), where you would usualy use `asyncio.run(main())`, you should use `await main()` instead for the expected results.  

## Acknowledgments
This extension builds on top of [Pyodide](https://pyodide.org/en/stable/development/core.html).
