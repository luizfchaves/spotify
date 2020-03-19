import axios from "axios";
import qs from "qs";
require("dotenv").config();

const accountAPI = "https://accounts.spotify.com/api/token";
const searchAPI = "https://api.spotify.com/v1/search";

const headers = {
  "Content-type": "application/x-www-form-urlencoded;charset=UTF-8"
};

export async function handleExpiredToken() {
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
        return;
      })
      .catch(error => {
        console.error("Error refreshing a token", error.response);
        throw new Error("Error refreshing a token");
      });
  } catch (error) {
    throw new Error("Error  on function of refreshing token");
  }
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
        console.log("funcionou", r.data);
        response = r.data;
      })
      .catch(error => {
        console.log("!funcionou", error.response);
        axiosError = error;
      });
    if (axiosError) throw new Error("Error handling search", axiosError);
  } catch (error) {
    throw new Error("Error handling search", error);
  }
  return response;
}
