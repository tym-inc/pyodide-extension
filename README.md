# 🐍 Run python files on the web with ZERO setup

Run Python code on VS Code without installing a Python intepreter! 🤯 

This magic is enabled by Pyodide 🪄, a port of CPython to WebAssembly/Emscripten that lets you run Python on the web!

## 🚀 How it works

1. Open a python file
2. Run it by clicking green play button on the top right corner of the editor.
3. See the output!
4. You can also stop the execution of your file by clicking on the red stop button.

## Known Limitations
1. [Certain modules](https://pyodide.org/en/stable/usage/wasm-constraints.html) cannot be loaded on Pyodide due to limitations of WASM. 
2. Python code may be slow to run when there are many imports, as a new web worker is created each time and the modules will be downloaded on each run. This was done to make sure local imports are handled correctly as there is no easy way for Pyodide to refresh local imports. Once the mechanism of this caching is more clear, a more efficient workaround may arise.

## Acknowledgments
This extension builds on top of:
1. [Pyodide](https://pyodide.org/en/stable/development/core.html)
