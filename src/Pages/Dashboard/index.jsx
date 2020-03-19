import React, { useState } from "react";
import { handleSearch, handleExpiredToken } from "./../../Helper/spotifyAPI";
import moment from "moment";
import "./styles.scss";

export default function Dashboard() {
  let [seached, setSeached] = useState(false);
  let [error, setError] = useState(false);
  let [loading, setLoading] = useState(false);
  let [lists, setLists] = useState({ tracks: [], artists: [], albums: [] });
  let [searchString, setSearchString] = useState("");

  function handleInputChange(value) {
    setSearchString(value);
  }
  async function handleToken() {
    try {
      let token = JSON.parse(localStorage.getItem("token"));
      if (new Date(token.expireDate).getTime() < new Date().getTime()) {
        try {
          await handleExpiredToken();
          token = await JSON.parse(localStorage.getItem("token"));
          console.log("token", token.acess_token);
          return token.acess_token;
        } catch (error) {
          setError("token");
          console.log("error token");
          return false;
        }
      }
      return token.access_token;
    } catch (error) {
      console.log("error token2");
      setError("token");
      return false;
    }
  }

  async function handleSubmit() {
    setSeached(true);
    setLoading(true);
    console.log("procurando");
    try {
      let acessToken = await handleToken();
      if (!acessToken) return;
      let response = await handleSearch(searchString, acessToken);
      console.log("resposta", response);
      let data = {};
      data.artists = response.artists.items;
      data.tracks = response.tracks.items;
      data.albums = response.albums.items;
      setLists(data);
    } catch (error) {
      setError("Search");
    }
    console.log("submited");
    setLoading(false);
  }

  function songFavorited(id) {
    let favoritedSongs = localStorage.getItem("favoritedSongs");
    if (!favoritedSongs) {
      favoritedSongs = [];
      localStorage.setItem("favoritedSongs", JSON.stringify(favoritedSongs));
    }
    if (favoritedSongs.includes(id)) return true;
    return false;
  }
  function handleFavoriteSong(id) {
    let favoriteSongs = localStorage.getItem("favoritedSongs");
    console.log("favoritas", favoriteSongs, id);
    if (favoriteSongs.includes(id)) {
      favoriteSongs = favoriteSongs.filter(r => r !== id);
    } else {
      favoriteSongs.push(id);
    }
  }

  return (
    <div className="content center">
      <div id="search-container">
        <input
          value={searchString}
          placeholder="Search for a artist, track or album"
          onKeyPress={e => {
            if (e.key === "Enter") handleSubmit();
          }}
          onChange={e => handleInputChange(e.target.value)}
          onDoubleClick={() => {
            console.log("list track", lists.tracks);
          }}
        />
        <button className="btn btn-primary" onClick={handleSubmit}>
          Search
        </button>
      </div>
      {error !== false ? null : seached ? (
        loading ? (
          <p>Carregando</p>
        ) : (
          <>
            <div id="lists-container">
              <div className="list-container">
                <p>Tracks</p>
                <div className="list">
                  {lists.tracks.map(r => (
                    <div className="item" key={r.id}>
                      <div className="img-container">
                        <img
                          src={r.album.images[0] ? r.album.images[0].url : null}
                          alt="Album of track"
                        />
                        <div className="favorite-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            onClick={() => handleFavoriteSong(r.id)}
                          >
                            {songFavorited(r.id) ? (
                              <path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z" />
                            ) : (
                              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181" />
                            )}
                          </svg>
                        </div>
                      </div>
                      <p className="duration">
                        Duração:{`${moment(r.duration_ms).format("mm:ss")}`}
                      </p>
                      <p className="name">{r.name}</p>
                      <div className="artists-list">
                        <p>
                          {r.artists.map((artist, index) => {
                            return `${artist.name}${
                              r.artists.length === index + 1 ? "" : ", "
                            }`;
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="list-container">
                <p>Artists</p>
                <div className="list"></div>
              </div>
              <div className="list-container">
                <p>Albums</p>
                <div className="list"></div>
              </div>
            </div>
          </>
        )
      ) : null}
    </div>
  );
}
