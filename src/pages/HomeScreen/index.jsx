import React from "react";
import { Link } from "react-router-dom";
import "./styles.scss";

export default function Homescreen() {
  return (
    <>
      <div id="homescreen">
        <h1>Spotify data by Luiz Chaves</h1>
        <p>A web app based on Spotify public API</p>
        <Link className="btn btn-primary" to="/login">
          Enter
        </Link>
      </div>
    </>
  );
}
