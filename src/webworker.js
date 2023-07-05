/* eslint-disable */
export default () => {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js");
    var results = '';
    async function loadPyodideAndPackages() {
        self.pyodide = await loadPyodide({
            stdin: () => {
                // Atomics.wait(arr, 0, 0);
                return '5';
            },
            stdout: (text) => {
                            if (text !== "Python initialization complete") {
                                results += text + '\n';
                        }
                        },
        });
        await self.pyodide.loadPackage(["numpy", "pytz"]);
    }
    let pyodideReadyPromise = loadPyodideAndPackages();

    self.onmessage = async (event) => {
    // make sure loading is done
    await pyodideReadyPromise;
    console.log(event.data);
    let arr = new Int32Array(event.data.buffMemLength);
    Atomics.wait(arr, 0, 0);
    console.group('[the worker thread]');
    console.log('Data received from the main thread: %i', arr[0]);
    console.groupEnd();
    // Don't bother yet with this line, suppose our API is built in such a way:
    const { id, python, ...context } = event.data;
    console.log('event.data', python);
    // The worker copies the context in its own "memory" (an object mapping name to values)
    for (const key of Object.keys(context)) {
        self[key] = context[key];
    }
    // Now is the easy part, the one that is similar to working in the main thread:
    try {
        // await self.pyodide.loadPackagesFromImports(python);
        await self.pyodide.runPythonAsync(python);
        self.postMessage({ results, id });
    } catch (error) {
        self.postMessage({ error: error.message, id });
    }
    };
}