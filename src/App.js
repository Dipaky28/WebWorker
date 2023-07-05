import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { PyodideRunner } from "./py-worker";

let pyodideRunner;

const python_code = `
from js import pyodide_context
print(pyodide_context.A_rank)
a=input();
for i in range(int(a)):
    print(i);
`;
const context = {
  A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
};

async function initializePyodideRunner() {
  // Load the service worker outside the PyodideRunner object so a single service worker may be used with multiple PyodideRunner instances
  let serviceWorker;
  await navigator.serviceWorker.register('./service-worker.js').then(function(registration) {
    serviceWorker = registration.active;
    if (!serviceWorker) {
      location.reload();
    }
  });
  pyodideRunner = new PyodideRunner(serviceWorker, 23);
}
let pyodideRunnerReadyPromise = initializePyodideRunner();

export default function App() {
   const run = async () => {
    try {
      await pyodideRunnerReadyPromise;
      let returnMsg = await pyodideRunner.runPython(python_code, context);
      if (returnMsg.state == "OK") {
        console.log("pyodideWorker return results: ", returnMsg.output);
      } else {
        console.log("pyodideWorker error: ", returnMsg.error);
      }
    } catch (e) {
      console.log(
        `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`,
      );
    }
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Web worker in React</p>
        <button onClick={() => run()}>Send Message</button>
      </header>
    </div>
  );
}
