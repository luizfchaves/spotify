import axios from "axios";
import qs from "qs";
require("dotenv").config();

const accountAPI = "https://accounts.spotify.com/api/token";
const searchAPI = "https://api.spotify.com/v1/search";

const headers = {
  "Content-type": "application/x-www-form-urlencoded;charset=UTF-8"
};

export async function handleExpiredToken() {
  let accessToken = "";
  try {
    let token = JSON.parse(localStorage.getItem("token"));
    const data = {
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
      client_id: process.env.REACT_APP_CLIENT_ID,
      client_secret: process.env.REACT_APP_CLIENT_SECRET
    };
    axios
      .post(accountAPI, qs.stringify(data), headers)
      .then(res => {
        const { data } = res;
        let newExpireDate = new Date();
        newExpireDate.setSeconds(newExpireDate.getSeconds() + data.expires_in);
        data.expireDate = newExpireDate;
        Object.assign(token, data);
        localStorage.setItem("token", JSON.stringify(token));
        accessToken = token.access_token;
      })
      .catch(error => {
        console.error("Error refreshing a token", error.response);
        throw new Error("Error refreshing a token");
      });
  } catch (error) {
    throw new Error("Error  on function of refreshing token");
  }
  return accessToken;
}

export async function handleNewToken(code) {
  try {
    let axiosError = false;
    const data = {
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.REACT_APP_SITE_URL}/login`,
      client_id: process.env.REACT_APP_CLIENT_ID,
      client_secret: process.env.REACT_APP_CLIENT_SECRET
    };
    axios
      .post(accountAPI, qs.stringify(data), {
        headers
      })
      .then(res => {
        const { data } = res;
        let newExpireDate = new Date();
        newExpireDate.setSeconds(newExpireDate.getSeconds() + data.expires_in);
        data.expireDate = newExpireDate;
        localStorage.setItem("token", JSON.stringify(data));
        return;
      })
      .catch(error => {
        axiosError = error;
      });
    if (axiosError)
      throw new Error(
        "Error getting a authorization token",
        axiosError.response
      );
  } catch (error) {
    throw new Error(
      "Error getting a authorization token function",
      error.response
    );
  }
}

export async function handleSearch(query, token) {
  let response = {};
  try {
    let axiosError = false;
    await axios
      .get(`${searchAPI}?q=${query}&type=album,track,artist`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => {
        response = r.data;
      })
      .catch(error => {
        axiosError = error;
      });
    if (axiosError) throw new Error("Error handling search", axiosError);
  } catch (error) {
    throw new Error("Error handling search", error);
  }
  return response;
}

export async function handleAlbumInfo(query, token) {
  let response = {};
  try {
    let axiosError = false;
    await axios
      .get(query, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => {
        response = r.data;
      })
      .catch(error => {
        console.log("!funcionou axios", error);
        axiosError = error;
      });

    if (axiosError)
      throw new Error("Error handling album informations", axiosError);
  } catch (error) {
    throw new Error("Error handling album informations", error);
  }
  return response;
}

export async function handleArtistInfo(artistId, token) {
  let response = {};
  try {
    let axiosError = false;
    let artistInfo = axios.get(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    let artistAlbums = axios.get(
      `https://api.spotify.com/v1/artists/${artistId}/albums?market=BR&limit=3`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    await axios
      .all([artistInfo, artistAlbums])
      .then(r => {
        console.log("About artists", r);
        response.artist = r[0].data;
        response.albums = r[1].data;
      })
      .catch(error => {
        console.log("!funcionou axios", error);
        axiosError = error;
      });

    if (axiosError)
      throw new Error("Error handling album informations", axiosError);
  } catch (error) {
    throw new Error("Error handling album informations", error);
  }
  return response;
}
export async function handleGetMore(query, token) {
  console.log("handlig get more", query, token);
  let response = {};
  try {
    let axiosError = false;
    await axios
      .get(query, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => {
        response = r.data;
      })
      .catch(error => {
        console.log("error axios", error);
        axiosError = error;
      });

    if (axiosError) throw new Error("Error getting more ", axiosError);
  } catch (error) {
    throw new Error("Error handling a", error);
  }
  return response;
}
