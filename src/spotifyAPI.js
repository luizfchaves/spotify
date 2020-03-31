import axios from "axios";
import qs from "qs";

require("dotenv").config();

const accountAPI = "https://accounts.spotify.com/api/token";
const generalAPI = "https://api.spotify.com/v1";

const headers = {
  "Content-type": "application/x-www-form-urlencoded;charset=UTF-8"
};

const handleExpireToken = () =>
  new Promise(async function(resolve, reject) {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const data = {
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
        client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        client_secret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
      };
      axios
        .post(accountAPI, qs.stringify(data), headers)
        .then(res => {
          const { data } = res;
          let newExpireDate = new Date();
          newExpireDate.setSeconds(
            newExpireDate.getSeconds() + data.expires_in
          );
          data.expireDate = newExpireDate;
          Object.assign(token, data);
          localStorage.setItem("token", JSON.stringify(token));
          resolve({ new_access_token: token.access_token });
        })
        .catch(error => {
          reject({
            errorMessage: "Error on spotifyAPI",
            errorRef: "REFRESH_TOKEN_API"
          });
        });
    } catch (error) {
      //localStorage.removeItem("token");
      //window.location.href = "/login";
      reject({
        errorMessage: "Error refreshing a token",
        errorRef: "REFRESH_TOKEN_FUNCTION"
      });
    }
  });

const handleToken = function() {
  return new Promise(async function(resolve, reject) {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      let access_token = token.access_token;

      if (new Date(token.expireDate).getTime() < new Date().getTime()) {
        await handleExpireToken()
          .then(response => {
            access_token = response.new_access_token;
          })
          .catch(err => {
            throw new Error();
          });
      }

      resolve({ token: access_token });
    } catch (error) {
      //localStorage.removeItem("token");
      //window.location.href = "/login";
      reject({
        errorMessage: "Error handling a token",
        errorRef: "HANDLE_TOKEN_FUNCTION"
      });
    }
  });
};

const handleNewToken = function(code) {
  return new Promise(async function(resolve, reject) {
    try {
      const data = {
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.REACT_APP_PUBLIC_URL}/login`,
        client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        client_secret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
      };
      await axios
        .post(accountAPI, qs.stringify(data), {
          headers
        })
        .then(res => {
          const { data } = res;
          let newExpireDate = new Date();
          newExpireDate.setSeconds(
            newExpireDate.getSeconds() + data.expires_in
          );
          data.expireDate = newExpireDate;
          localStorage.setItem("token", JSON.stringify(data));
          resolve({ message: "You are logged in!" });
        })
        .catch(error => {
          reject({
            errorMessage: "Error getting a new token",
            errorRef: "NEW_TOKEN_API"
          });
        });
    } catch (error) {
      reject(
        reject({
          errorMessage: "Error getting a new token",
          errorRef: "NEW_TOKEN_FUNCTION"
        })
      );
    }
  });
};

const search = function(query) {
  return new Promise(async function(resolve, reject) {
    reject("isso msm que vc leu");
    try {
      if (query === "") {
        reject(
          reject({
            errorMessage: "Query empty",
            errorRef: "QUERY_EMPTY"
          })
        );
      }

      let token = "";
      await handleToken()
        .then(r => (token = r.token))
        .catch(err => {
          reject({
            errorMessage: "Problem with token",
            errorRef: "SEARCH_TOKEN"
          });
        });
      await axios
        .get(`${generalAPI}/search?q=${query}&type=album,track,artist`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(r => {
          resolve(r.data);
        })
        .catch(error =>
          reject({
            errorMessage: "Error on searching API",
            errorRef: "SEARCH_API"
          })
        );
    } catch (error) {
      reject({
        errorMessage: "Error o search function",
        errorRef: "SEARCH_FUNCTION"
      });
    }
  });
};

const handleMoreInfo = function(itemId, type) {
  return new Promise(async function(resolve, reject) {
    try {
      if (itemId === "") {
        reject(
          reject({
            errorMessage: "Query empty",
            errorRef: "QUERY_EMPTY"
          })
        );
      }
      let token = "";
      await handleToken()
        .then(r => (token = r.token))
        .catch(err => {
          reject({
            errorMessage: "Problem with token",
            errorRef: "MORE_INFO_TOKEN"
          });
        });
      let responses = [
        await axios.get(`${generalAPI}/${type}/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ];
      if (type === "artists")
        responses.push(
          await axios.get(`${generalAPI}/${type}/${itemId}/albums?market=BR`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
      await axios
        .all(responses)
        .then(r => {
          resolve([r[0].data, r[1] ? r[1].data : null]);
        })
        .catch(error =>
          reject({
            errorMessage: "Error on see more API",
            errorRef: "MORE_INFO_API",
            error
          })
        );
    } catch (error) {
      reject({
        errorMessage: "Error o getting more info function",
        errorRef: "MORE_INFO_FUNCTION",
        error
      });
    }
  });
};

const handleGetMore = function(totalQuery) {
  return new Promise(async function(resolve, reject) {
    try {
      let token = "";
      await handleToken()
        .then(r => (token = r.token))
        .catch(err => {
          reject({
            errorMessage: "Problem with token",
            errorRef: "GET_MORE_TOKEN"
          });
        });

      await axios
        .get(totalQuery, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(r => {
          resolve(r.data);
        })
        .catch(error => {
          reject({
            errorMessage: "Error on get more API",
            errorRef: "GET_MORE_API",
            error
          });
        });
    } catch (error) {
      reject({
        errorMessage: "Error o getting more",
        errorRef: "GET_MORE_FUNCTION",
        error
      });
    }
  });
};

export { handleNewToken, handleToken, search, handleMoreInfo, handleGetMore };
