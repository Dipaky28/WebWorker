export default () => {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js");

    self.pyodide_context = {};
    let results = '';

    async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide({
        stdin: () => {
            let responseText = self.fetchInput(results);
            console.log(responseText);
            // Reset the output since the output so far has already been passed to the main thread
            results = '';
            return responseText;
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
            self.postMessage({ id, type: "RUN_PYTHON_RESPONSE", state: "OK", output: results });
        } catch (error) {
            self.postMessage({ id, type: "RUN_PYTHON_RESPONSE", state: "ERROR", error: error.message });
        }
    };

    self.fetchInput = function(output) {
        self.postMessage({type: "REQUEST_INPUT", output: output});
        const request = new XMLHttpRequest();
        request.open('GET', `${self.location.origin}/wait_for_user_input/`, false);
        request.send(null);
        return request.responseText;
    }
}