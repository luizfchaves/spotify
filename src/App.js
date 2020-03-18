import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Homescreen from "./Pages/Homescreen";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        <Route path="/">
          <Homescreen />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
