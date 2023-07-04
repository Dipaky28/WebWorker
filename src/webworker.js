export default () => {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js");

    self.pyodide_context = {};
    let results = '';

    async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide({
        stdin: () => {
            const sab = new SharedArrayBuffer(1024);
            let inputArr = Int16Array(sab);
            worker.postMessage({"type": "REQUEST_INPUT", "sharedBuffer": sab});
            Atomics.wait(inputArr, 0, 0);
            return inputArr[0]
        },
        stdout: (output) => {
            results += output + '\n';
        }
      });
    }
    let pyodideReadyPromise = loadPyodideAndPackages();

    self.onmessage = async (event) => {
        await pyodideReadyPromise;
        switch (event.data.type) {
            case "RUN_PYTHON":
                self.runPython(event.data);
                break;
        }
    };

    self.runPython = async function(data) {
        // Set the timer logic here, and post a message with an error code if it takes too long
        results = '';
        const { id, type, python, ...context } = data;
        console.log('Running python code:', python);
        self.pyodide_context = context;
        try {
            await self.pyodide.runPythonAsync(python);
            self.postMessage({ id, state: "OK", output: results });
        } catch (error) {
            self.postMessage({ id, state: "ERROR", error: error.message });
        }
    };
}