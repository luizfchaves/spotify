import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Provider } from "react-redux";
import store from "./store";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import HomeScreen from "./pages/HomeScreen";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route>
            <HomeScreen />
          </Route>
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
