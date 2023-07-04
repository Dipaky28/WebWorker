import WorkerBuilder from "./worker-builder";
import FiboWorker from "./webworker";
const pyodideWorker = new WorkerBuilder(FiboWorker);

let serviceWorker;

navigator.serviceWorker.register('./service-worker.js').then(function(registration) {
  serviceWorker = registration.active;
  if (!serviceWorker) {
    location.reload();
  }
});

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
    switch (event.data.type) {
      case "REQUEST_INPUT":
        // Wait for input by user, can be some asynchronous function here
        console.log("Output of pyodide before fetching input: "+event.data.output)
        let inputValue = prompt("Enter a value", "10");
        this.passInput(inputValue);
        break
      default:
        const { id, type, ...data } = event.data;
        const onSuccess = callbacks[id];
        delete callbacks[id];
        onSuccess(data);
        break;
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
    serviceWorker.postMessage(msg);
  }

  this.generateNewId = function() {
    this.curr_id = (this.curr_id + 1) % Number.MAX_SAFE_INTEGER;
  };
};

export { PyodideRunner };