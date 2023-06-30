import { useState, useEffect } from 'react';

const usePyodide = () => {
  const [pyodide, setPyodide] = useState(null);

  useEffect(() => {
    const loadPyodide = async () => {
      // Load the Pyodide global object
      const loading_pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.3/full/"
        });

      // Set the Pyodide instance
      setPyodide(loading_pyodide);
    };

    loadPyodide();
  }, []);

  return pyodide;
};

export default usePyodide;
