import React, { useState, useEffect } from "react";
import {
  handleSearch,
  handleExpiredToken,
  handleAlbumInformation
} from "./../../Helper/spotifyAPI";
import { Modal } from "reactstrap";
import moment from "moment";
import "./styles.scss";

export default function Dashboard() {
  let [seached, setSeached] = useState(false);
  let [error, setError] = useState(false);
  let [loading, setLoading] = useState(false);
  let [lists, setLists] = useState({ tracks: [], artists: [], albums: [] });
  let [searchString, setSearchString] = useState("");
  let [favoritedSongs, setFavoritedSongs] = useState([]);
  let [albumSelected, setAlbumSelected] = useState(null);

  useEffect(() => {
    getFavoritedSongs();
  }, []);

  function handleInputChange(value) {
    setSearchString(value);
  }
  async function handleToken() {
    try {
      let token = JSON.parse(localStorage.getItem("token"));
      if (new Date(token.expireDate).getTime() < new Date().getTime()) {
        try {
          await handleExpiredToken();
          await setTimeout(async () => {
            token = await JSON.parse(localStorage.getItem("token"));
          }, 500);
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
    setError(false);
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
  function getFavoritedSongs() {
    setFavoritedSongs(JSON.parse(localStorage.getItem("favoritedSongs")));
  }
  function saveFavoritedSongs(_favoritedSongs) {
    setFavoritedSongs(_favoritedSongs);
    localStorage.setItem("favoritedSongs", JSON.stringify(_favoritedSongs));
    getFavoritedSongs();
  }

  function checkIfSongIsFavorited(id) {
    if (favoritedSongs.includes(id)) return true;
    return false;
  }
  async function handleFavoriteSong(id) {
    let _favoritedSongs = favoritedSongs;
    if (favoritedSongs.includes(id)) {
      _favoritedSongs = favoritedSongs.filter(r => r !== id);
      console.log("removed song", _favoritedSongs, id);
    } else {
      _favoritedSongs.push(id);
    }
    saveFavoritedSongs(_favoritedSongs);
  }
  async function handleAlbumClicked(album) {
    try {
      setAlbumSelected({ loading: true });
      let acessToken = await handleToken();
      if (!acessToken) return;
      let response = await handleAlbumInformation(album.href, acessToken);
      console.log("funcionou", response);
      response.loading = false;
      setAlbumSelected(response);
    } catch (error) {
      console.log("!funcionou", error);
    }
    //setAlbumSelected(album);
  }

  return (
    <>
      <Modal isOpen={albumSelected != null} id="album-modal">
        {albumSelected ? (
          albumSelected.loading ? (
            <p className="message">Loading</p>
          ) : (
            <div className="album">
              <div className="img-container">
                <img
                  src={
                    albumSelected.images[0] ? albumSelected.images[0].url : null
                  }
                  alt="Album cover"
                />
              </div>
              <p className="album-title">{albumSelected.name}</p>
              <div className="music-list">
                <div className="list-header">
                  <div className="music">
                    <p className="index">#</p>
                    <div className="favorite-icon"></div>
                    <p className="music-name">Music name</p>
                  </div>
                </div>
                <div className="list-body">
                  {albumSelected.tracks.items.map((r, i) => (
                    <div className="music" key={r.id}>
                      <p className="index">{i + 1}</p>
                      <div className="favorite-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          onClick={() => {
                            handleFavoriteSong(r.id);
                          }}
                        >
                          {checkIfSongIsFavorited(r.id) ? (
                            <path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z" />
                          ) : (
                            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181" />
                          )}
                        </svg>
                      </div>
                      <p className="music-name">{r.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setAlbumSelected(null);
                }}
              >
                Fechar
              </button>
            </div>
          )
        ) : null}
      </Modal>
      <div className="content center">
        <div id="search-container">
          <input
            value={searchString}
            placeholder="Search for a artist, track or album"
            onKeyPress={e => {
              if (e.key === "Enter") handleSubmit();
            }}
            onChange={e => {
              handleInputChange(e.target.value);
              setSeached(false);
              setLists({ tracks: [], artists: [], albums: [] });
            }}
            onDoubleClick={() => {
              console.log("list track", lists.tracks);
            }}
          />
          <button className="btn btn-primary" onClick={handleSubmit}>
            Search
          </button>
        </div>
        {error !== false ? (
          <p className="message">Ocorreu algum erro</p>
        ) : seached ? (
          loading ? (
            <p className="message">Carregando</p>
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
                            src={
                              r.album.images[0] ? r.album.images[0].url : null
                            }
                            alt="Album of track"
                          />
                          <div className="favorite-icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              onClick={() => {
                                handleFavoriteSong(r.id);
                              }}
                            >
                              {checkIfSongIsFavorited(r.id) ? (
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
                        <div className="description">
                          <p>
                            Artitst(s):
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
                  <div className="list">
                    {lists.artists.map(r => (
                      <div className="item" key={r.id}>
                        <div className="img-container">
                          <img
                            src={r.images[0] ? r.images[0].url : null}
                            alt="Artist token"
                          />
                        </div>
                        <p className="name">{r.name}</p>
                        <div className="description">
                          <p>Popularity: {r.popularity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="list-container">
                  <p>Albums</p>
                  <div className="list">
                    {lists.albums.map(r => (
                      <div
                        className="item clickable"
                        key={r.id}
                        onClick={() => {
                          handleAlbumClicked(r);
                        }}
                      >
                        <div className="img-container">
                          <img
                            src={r.images[0] ? r.images[0].url : null}
                            alt="Artist token"
                          />
                        </div>
                        <p className="name">{r.name}</p>
                        <div className="description">
                          <p>
                            Artitst(s):
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
              </div>
            </>
          )
        ) : null}
      </div>
    </>
  );
}
