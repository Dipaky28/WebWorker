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
let typedArr = new Int32Array(InputBuffer);

// const interruptBuffer = new Int32Array(new SharedArrayBuffer(4));

const setinput = () => {
  const text = document.getElementById('name').value;
  // const text = "Hello, World!";
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
  // interruptBuffer[0] = 2;
  console.log('Execution interupption is in progress');
  // pyodideWorker.postMessage({cmd: 'interruptExecution', interruptBuffer})

};
const asyncRun = (() => {
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