import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { asyncRun } from "./py-worker";
// import usePyodide from './pyodideInstance';

const script = `
    for i in range(10):
        print(i);
`;

const context = {
  A_rank: [0.8, 0.4, 1.2, 3.7, 2.6, 5.8],
};

export default function App() {
  // const pyodide = usePyodide();
  // console.log(pyodide);
   const run = async () => {
    try {
      const { results, error } = await asyncRun(script, context);
      if (results) {
        console.log("pyodideWorker return results: ", results);
      } else if (error) {
        console.log("pyodideWorker error: ", error);
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
          <p>
            Web worker in React
          </p>
          <button
          onClick={() => run()}
          >Send Message</button>
        </header>
      </div>
    );
}
