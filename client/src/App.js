import React, { useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import './App.css';

import Header from './components/Header';
import Home from './components/Home';
import Room from './components/Room';

function App() {
  const [player, setPlayer] = useState(undefined);

  return (
    <Router>
      <div className="App">
        <Header player={player} setPlayer={setPlayer}/>
        <Route exact path="/">
          <Home player={player} setPlayer={setPlayer}/>
        </Route>
        <Route exact path="/room">
          <Room player={player}/>
        </Route>
      </div>
    </Router>
  );
}

export default App;
