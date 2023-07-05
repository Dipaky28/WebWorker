import WorkerBuilder from "./worker-builder";
import FiboWorker from "./webworker";

let MessageBuilder = function() {
  this.buildRunPythonMessage = function(id, python, context) {
    return {
      id,
      type: "RUN_PYTHON",
      python,
      ...context
    };
  };
  this.buildInputValueMessage = function(messageID, inputValue) {
    return {
      id: messageID,
      type: "SET_INPUT_VALUE",
      inputValue
    };
  };
  this.buildSendMessageID = function(id) {
    return {
      type: "PASS_WORKER_ID",
      "workerID": id
    }
  }
};

let PyodideRunner = function(serviceWorkerInstance, workerID) {
  const pyodideWorker = new WorkerBuilder(FiboWorker);
  const serviceWorker = serviceWorkerInstance;
  const msgBuilder = new MessageBuilder();

  const callbacks = {};
  let currID = 0;

  // Send the worker its ID
  sendWorkerID(workerID);

  pyodideWorker.onmessage = (event) => {
    switch (event.data.type) {
      case "RUN_PYTHON_RESPONSE":
        const { id, type, ...data } = event.data;
        const onSuccess = callbacks[id];
        delete callbacks[id];
        onSuccess(data);
        break;
      case "REQUEST_INPUT":
        // Wait for input by user, can be some asynchronous function here
        console.log("Output of pyodide before fetching input: "+event.data.output)
        let inputValue = prompt("Enter a value", "10");
        let messageID = event.data.id;
        passInput(inputValue, messageID);
        break
    }
  };

  this.runPython = async function(python_code, context) {
    generateNewID();
    return new Promise((onSuccess) => {
      callbacks[currID] = onSuccess;
      let msg = msgBuilder.buildRunPythonMessage(currID, python_code, context);
      pyodideWorker.postMessage(msg);
    });
  };
  
  function passInput(inputValue, messageID) {
    let msg = msgBuilder.buildInputValueMessage(messageID, inputValue);
    serviceWorker.postMessage(msg);
  };

  function sendWorkerID(id) {
    let msg = msgBuilder.buildSendMessageID(id);
    pyodideWorker.postMessage(msg);
  }
  function generateNewID() {
    currID = (currID + 1) % Number.MAX_SAFE_INTEGER;
  }
};

export { PyodideRunner };