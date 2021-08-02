import * as React from "react";
import "./App.css";
import "./Button.css";
import {ChangeEvent} from "react";

const App = () => {
    const [token, setToken] = React.useState("");
    const [useJenkins, setUseJenkins] = React.useState(true);

    const handleSave = () => {
        chrome.storage.sync.set({token: token, useJenkins: useJenkins}, function() {
            console.log('Token is set to %s, UseJenkins is %s', token, useJenkins);
        });
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setToken(event.currentTarget.value)
    }

    const handleButton = () => {
        setUseJenkins(!useJenkins)
    }

  return (
      <div className="App">
        <header className="App-header">
          <img src="icon128.png" className="App-logo" alt="logo" />
          <p>Hello there!</p>
        </header>
          <div className="buttonContainer">
              <input type="text" value={token} onChange={handleChange} />
          </div>
          <div className="buttonContainer">
              <button className="configButton" onClick={handleButton}>
                  {useJenkins ? "Disable Jenkins PR build" : "Activate Jenkins PR build"}
              </button>
          </div>
          <div className="buttonContainer">
              <button onClick={handleSave}>
                  Save
              </button>
          </div>
      </div>
  );
};

export default App;
