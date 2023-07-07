/* eslint-disable */

importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js");
let results = '';
let arr;
self.interruptBuffer = null;
async function loadPyodideAndPackages() {
self.pyodide = await loadPyodide({
    stdin: () => {
        console.log('Waiting for input...');
        Atomics.wait(arr, 0, -1);
        // Atomics.load(arr, 0); // 1
        // const decoder = new TextDecoder();
        // const receivedText = decoder.decode(arr);

        console.log(arr);
        const arr_data = arr.filter(val => val != -1);
        const decodedText = String.fromCharCode.apply(null, arr_data);
        console.log(decodedText.length);
        console.log('done loading', arr[0]);
        for (let i = 0; i < decodedText.length; i++) {
            arr[i] = -1;
          }
        console.log('reset array buffer', arr)
        return `${decodedText}`;
    },
    stdout: (text) => {
    if (text !== "Python initialization complete") {
        results += text + '\n';
    }
    },
});

await self.pyodide.loadPackage(["numpy", "pytz"]);
self.pyodide.setInterruptBuffer(self.interruptBuffer);
console.log('finished setting buffer');
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {

    console.log(event);
    if (event.data.cmd == 'runPython') {
        await pyodideReadyPromise;

        console.log(event.data);
        arr = new Int32Array(event.data.InputBuffer);

        console.group('[the worker thread]');
        console.log('Data received from the main thread: %i', arr[0]);
        console.groupEnd();

        const { id, python, ...context } = event.data;
        console.log('event.data', python);

        for (const key of Object.keys(context)) {
            self[key] = context[key];
        }

        try {
            await self.pyodide.runPythonAsync(python);
            self.postMessage({ results, id });
        } catch (error) {
            self.postMessage({ error: error.message, id });
        }
    } else if (event.data.cmd == 'interruptExecution') {
        console.log('Interrupting execution');
        console.log(event.data.interruptBuffer);
        console.log('--------------------------------')
        // self.pyodide.setInterruptBuffer(event.data.interruptBuffer);
        self.interruptBuffer = event.data.interruptBuffer;
        console.log('will set buffer');
    }
};
