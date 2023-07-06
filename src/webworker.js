/* eslint-disable */

importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.3/full/pyodide.js");
let results = '';
let arr;
async function loadPyodideAndPackages() {
self.pyodide = await loadPyodide({
    stdin: () => {

        Atomics.wait(arr, 0, 20);
        Atomics.load(arr, 0); // 1
        console.log('done loading', arr[0]);
        return arr[0];
    },
    stdout: (text) => {
    if (text !== "Python initialization complete") {
        results += text + '\n';
    }
    },
});

await self.pyodide.loadPackage(["numpy", "pytz"]);
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
await pyodideReadyPromise;

console.log(event.data);

arr = new Int32Array(event.data.buffMemLength);

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
};
