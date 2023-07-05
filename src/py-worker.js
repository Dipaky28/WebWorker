import WorkerBuilder from "./worker-builder";
import FiboWorker from "./webworker";
const pyodideWorker = new WorkerBuilder(FiboWorker);
console.log(pyodideWorker);
const callbacks = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};
let buffMemLength;
if(window.crossOriginIsolated) {
  buffMemLength = new window.SharedArrayBuffer(4); //byte length
} else {
  buffMemLength = new ArrayBuffer(4); //byte length
}
let typedArr = new Int32Array(buffMemLength);

const asyncRun = (() => {
  typedArr[0] = 20;
  let id = 0; // identify a Promise
  return (script, context) => {
    console.log(script)
    console.log(context)
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python: script,
        id,
        buffMemLength
      });
    });
  };
})();

export { asyncRun };