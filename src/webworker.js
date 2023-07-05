export default () => {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js");

    self.pyodide_context = {};
    let results = '';
    let workerID = 0;
    let currInputRequestID = 0;

    async function loadPyodideAndPackages() {
        self.pyodide = await loadPyodide({
            stdin: () => {
                let responseText = fetchInput(results);
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
                runPython(event.data);
                break;
            case "PASS_WORKER_ID":
                setWorkerID(event.data);
                break;
        }
    };

     async function runPython(data) {
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

    function fetchInput(output) {
        let inputID = generateNewInputID();
        self.postMessage({type: "REQUEST_INPUT", output: output, id: inputID});
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${self.location.origin}/wait_for_user_input/`, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ id: inputID }));
        console.log(xhr.status);
        return xhr.responseText;
    }

    function setWorkerID(data) {
        workerID = data.workerID;
        console.log('workerID set to: '+workerID);
    }
    function generateNewInputID() {
        currInputRequestID = (currInputRequestID + 1) % Number.MAX_SAFE_INTEGER;
        return workerID + "_" + currInputRequestID;
    }
}