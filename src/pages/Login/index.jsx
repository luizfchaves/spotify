import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import queryString from "query-string";
import { handleNewToken, handleToken } from "./../../spotifyAPI";
import { Button } from "reactstrap";
require("dotenv").config();

const Login = () => {
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(false);

  async function handleLogin() {
    const url = queryString.parse(window.location.search);
    if (!url.code) {
      try {
        await handleToken()
          .then(r => {
            setLoading(false);
            setError(false);
          })
          .catch(error => {
            throw new Error();
          });
      } catch (error) {
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_PUBLIC_URL}/login`;
        return;
      }
    } else {
      await handleNewToken(url.code)
        .then(r => {
          setLoading(false);
          setError(false);
        })
        .catch(error => {
          setLoading(false);
          setError(true);
        });
    }
  }

  useEffect(() => {
    handleLogin();
  });

  return (
    <div>
      {loading ? (
        <h2>Loading</h2>
      ) : error ? (
        <>
          <p>Some error has ocourred</p>
          <Button onClick={handleLogin}>Try Again</Button>
        </>
      ) : (
        <Redirect to="/dashboard" />
      )}
    </div>
  );
};
export default Login;
