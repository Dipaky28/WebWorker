/* eslint-disable */

const pyodideWorker = new Worker(new URL('./webworker.js', import.meta.url));
console.log(pyodideWorker);
const callbacks = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};
let InputBuffer;
if(window.crossOriginIsolated) {
  InputBuffer = new window.SharedArrayBuffer(1024); //byte length
} else {
  InputBuffer = new ArrayBuffer(1024); //byte length
}

const interruptBuffer = new Int32Array(new SharedArrayBuffer(4));
pyodideWorker.postMessage({cmd: 'interruptExecution', interruptBuffer})

const setinput = () => {
  const text = document.getElementById('name').value;
  // const text = "Hello, World!";
  let typedArr = new Int32Array(InputBuffer);
  for (let i = 0; i < text.length; i++) {
    typedArr[i] = text.charCodeAt(i);
  }
  console.log(typedArr);
  // typedArr.set(encodedText);
  // const decodedText = String.fromCharCode.apply(null, typedArr);
  // Atomics.store(typedArr, 0, text);
  Atomics.notify(typedArr, 0);
 }

const interruptExecution = () => {
  console.log('Execution interupption is in progress');
  interruptBuffer[0] = 2;

};
const asyncRun = (() => {
  let typedArr = new Int32Array(InputBuffer);
  typedArr.fill(-1);
  console.log(`typedArr: ${typedArr}`);
  let id = 0; // identify a Promise
  return (script, context) => {
    console.log(script)
    console.log(context)
    console.log('updated', typedArr);
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python: script,
        id,
        InputBuffer,
        cmd: 'runPython'
      });
    });
  };
})();

export { asyncRun, setinput, interruptExecution };