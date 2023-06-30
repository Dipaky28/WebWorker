import WorkerBuilder from "./worker-builder";
import FiboWorker from "./webworker";
const pyodideWorker = new WorkerBuilder(FiboWorker);
console.log(pyodideWorker);
const callbacks = {};

pyodideWorker.onmessage = (event) => {
  console.log(event);
  const { id, ...data } = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

const asyncRun = (() => {
  let id = 0; // identify a Promise

  return (script, context) => {
    console.log(script)
    console.log(context)
    console.log(pyodide)
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python: script,
        id,
        pyodide: pyodide
      });
    });
  };
})();

export { asyncRun };