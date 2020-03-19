import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import queryString from "query-string";

import { handleExpiredToken, handleNewToken } from "./../../Helper/spotifyAPI";

require("dotenv").config();

export default function Login() {
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(false);

  async function handleStorageToken() {
    try {
      let token = await JSON.parse(localStorage.getItem("token"));
      if (new Date(token.expireDate).getTime() < new Date().getTime()) {
        try {
          await handleExpiredToken();
          setLoading(false);
        } catch (error) {
          localStorage.removeItem("token");
          throw new Error("Not able to handle a storage token");
        }
      }
      setLoading(false);
    } catch (error) {
      throw new Error("Not able to handle a storage token");
    }
  }

  async function handleNewLogin() {
    const url = queryString.parse(window.location.search);
    if (!url.code) {
      window.location.href = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_SITE_URL}/login`;
      return;
    }
    try {
      await handleNewToken(url.code);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    async function handlers() {
      try {
        await handleStorageToken();
      } catch (error) {
        await handleNewLogin();
      }
    }
    handlers();
  }, []);

  return (
    <div className="content center">
      {loading ? (
        <h2>Carregando</h2>
      ) : error ? (
        <>
          <p>Houve um erro</p>
          <Link to="/">Tente novamente</Link>
        </>
      ) : (
        <Redirect to="/dashboard" />
      )}
    </div>
  );
}
