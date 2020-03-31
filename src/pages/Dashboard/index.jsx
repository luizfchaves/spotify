import React from "react";

import SearchBar from "./../../components/SearchBar";
import Lists from "./../../components/Lists";
import MoreInfo from "./../../components/MoreInfo";

import "./styles.scss";

const Dashboard = () => {
  return (
    <div id="dashboard">
      <SearchBar />
      <MoreInfo />
      <Lists />
    </div>
  );
};

export default Dashboard;
