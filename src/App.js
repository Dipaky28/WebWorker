import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { PyodideRunner } from "./py-worker";

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

const pyodideRunner = new PyodideRunner();

export default function App() {
   const run = async () => {
    try {
      // Return a state object
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
