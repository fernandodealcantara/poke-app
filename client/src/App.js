import React, { useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import './App.css';

import Header from './components/Header';
import Home from './components/Home';
import Room from './components/Room';

function App() {
  const [user, setUser] = useState('Teste user');
  const [room, setRoom] = useState('Teste room');

  return (
    <Router>
      <div className="App">
        <Header user={user} room={room}/>
        <Route exact path="/">
          <Home setUser={setUser} setRoom={setRoom} />
        </Route>
        <Route path="/room">
          <Room user={user} room={room} />
        </Route>
      </div>
    </Router>
  );
}

export default App;
