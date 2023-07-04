import WorkerBuilder from "./worker-builder";
import FiboWorker from "./webworker";
const pyodideWorker = new WorkerBuilder(FiboWorker);

let MessageBuilder = function() {
  this.buildRunPythonMessage = function(id, python, context) {
    return {
      id,
      type: "RUN_PYTHON",
      python,
      ...context
    };
  };

  this.buildInputValueMessage = function(inputValue) {
    return {
      type: "SET_INPUT_VALUE",
      inputValue
    };
  };
};

let PyodideRunner = function() {
  const callbacks = {};
  const msgBuilder = new MessageBuilder();
  this.curr_id = 0;

  pyodideWorker.onmessage = (event) => {
    if (event.type == "REQUEST_INPUT") {
      // Wait for input by user
      let inputArr = new Int16Array(event.sharedBuffer);
      Atomics.store(inputArr, 0, 123);
      Atomics.notify(inputArr, 0, 1);
    } else {
      const { id, ...data } = event.data;
      const onSuccess = callbacks[id];
      delete callbacks[id];
      onSuccess(data);
    }
  };

  this.runPython = async function(python_code, context) {
    this.generateNewId();
    return new Promise((onSuccess) => {
      callbacks[this.curr_id] = onSuccess;
      let msg = msgBuilder.buildRunPythonMessage(this.curr_id, python_code, context);
      pyodideWorker.postMessage(msg);
    });
  };
  
  this.passInput = function(inputValue) {
    let msg = msgBuilder.buildInputValueMessage(inputValue);
    pyodideWorker.postMessage(msg);
  }

  this.generateNewId = function() {
    this.curr_id = (this.curr_id + 1) % Number.MAX_SAFE_INTEGER;
  };
};

export { PyodideRunner };