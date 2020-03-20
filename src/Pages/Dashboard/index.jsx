import React, { useState, useEffect } from "react";
import {
  handleSearch,
  handleExpiredToken,
  handleAlbumInfo,
  handleArtistInfo
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
  let [artistSelected, setArtistSelected] = useState(null);

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
          token.access_token = await handleExpiredToken();
        } catch (error) {
          setError("token");
          console.log("error token");
          return false;
        }
      }
      console.log("token handled");
      return token.access_token;
    } catch (error) {
      console.log("error token");
      localStorage.removeItem("token");
      window.location.href = "/login";
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

      let response = await handleSearch(searchString, acessToken);
      console.log("resposta", response);
      let data = {};
      data.artists = response.artists.items;
      data.tracks = response.tracks.items;
      data.albums = response.albums.items;
      data.next = {
        artists: response.artists.next,
        tracks: response.tracks.next,
        albums: response.tracks.albums
      };
      setLists(data);
    } catch (error) {
      setError("Search");
    }
    console.log("submited");
    setLoading(false);
  }
  function getFavoritedSongs() {
    console.log("Favorited songs");
    let _favoritedSongs = JSON.parse(localStorage.getItem("favoritedSongs"));
    if (!_favoritedSongs) {
      _favoritedSongs = [];

      localStorage.setItem("favoritedSongs", JSON.stringify(_favoritedSongs));
    }
    setFavoritedSongs(_favoritedSongs);
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
      setArtistSelected(null);
      setAlbumSelected({ loading: true });
      let acessToken = await handleToken();
      if (!acessToken) return;
      let response = await handleAlbumInfo(album.href, acessToken);
      console.log("funcionou", response);
      response.loading = false;
      setAlbumSelected(response);
    } catch (error) {
      setAlbumSelected(null);
    }
  }
  async function handleArtistClicked(artistID) {
    try {
      setAlbumSelected(null);
      setArtistSelected({ loading: true });
      let acessToken = await handleToken();
      if (!acessToken) return;
      let response = await handleArtistInfo(artistID, acessToken);
      console.log("funcionou", response);
      response.loading = false;
      setArtistSelected(response);
    } catch (error) {
      setArtistSelected(null);
    }
  }
  /*
  async function handleGetMoreClicked(place, query) {
    console.log("handling get more", query, place);
    try {
      let acessToken = await handleToken();
      if (!acessToken) return;
      let response = await handleGetMore(query, acessToken);
      if (place.includes("album")) {
      }
      let _lists = lists;
      _lists[place] = _lists[place].concat(response[place].items);
      _lists.next[place] = response[place].next;
      setLists(_lists);
    } catch (error) {
      console.log("error getting more", error);
      alert("Ocorreu algum erro");
    }
  }*/

  return (
    <>
      <Modal isOpen={albumSelected != null} id="album-modal">
        {albumSelected ? (
          albumSelected.loading ? (
            <p className="message">Loading</p>
          ) : (
            <div className="modal-content" id="album">
              <div className="img-container">
                <img
                  src={
                    albumSelected.images[0] ? albumSelected.images[0].url : null
                  }
                  alt="Album cover"
                />
              </div>
              <p className="title">{albumSelected.name}</p>
              <div className="artists-list">
                {albumSelected.artists.map(artist => (
                  <p
                    onClick={() => {
                      handleArtistClicked(artist.id);
                    }}
                    className="artist-name"
                    key={artist.id}
                  >
                    {artist.name}
                  </p>
                ))}
              </div>
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
                Close
              </button>
            </div>
          )
        ) : null}
      </Modal>

      <Modal isOpen={artistSelected != null} id="artist-modal">
        {artistSelected ? (
          artistSelected.loading ? (
            <p className="message">Loading</p>
          ) : (
            <div className="modal-content" id="artist">
              <div className="img-container">
                {artistSelected.artist.images[0] ? (
                  <img
                    src={artistSelected.artist.images[0].url}
                    alt="Album cover"
                  />
                ) : null}
              </div>

              <p className="title">{artistSelected.artist.name}</p>

              <div className="list-container">
                <p> Albums</p>
                <div className="list">
                  {artistSelected.albums.items.map(album => (
                    <div
                      className="item clickable"
                      key={album.id}
                      onClick={() => {
                        handleAlbumClicked(album);
                      }}
                    >
                      <div className="img-container">
                        {album.images[0] ? (
                          <img src={album.images[0].url} alt="Artist token" />
                        ) : null}
                      </div>
                      <p className="name">{album.name}</p>
                      <div className="description">
                        <p>
                          Artitst(s):
                          {album.artists.map((artist, index) => {
                            return `${artist.name}${
                              album.artists.length === index + 1 ? "" : ", "
                            }`;
                          })}
                        </p>
                      </div>
                      <button className="btn btn-primary">See more</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : null}
        <button
          className="btn btn-primary"
          onClick={() => {
            setArtistSelected(null);
          }}
        >
          Close
        </button>
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
                  <p
                    onClick={() => {
                      console.log(lists);
                    }}
                  >
                    Tracks
                  </p>
                  <div className="list">
                    {lists.tracks.map(track => (
                      <div className="item" key={track.id}>
                        <div className="img-container">
                          <img
                            src={
                              track.album.images[0]
                                ? track.album.images[0].url
                                : null
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
                                handleFavoriteSong(track.id);
                              }}
                            >
                              {checkIfSongIsFavorited(track.id) ? (
                                <path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z" />
                              ) : (
                                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181" />
                              )}
                            </svg>
                          </div>
                        </div>
                        <p className="duration">
                          Duração:
                          {`${moment(track.duration_ms).format("mm:ss")}`}
                        </p>
                        <p className="name">{track.name}</p>
                        <div className="description album-description">
                          <div className="artists-list">
                            <p>Artist(s):</p>
                            {track.artists.map((artist, index) => {
                              return (
                                <p
                                  onClick={() => {
                                    handleArtistClicked(artist.id);
                                  }}
                                  className="artist-name"
                                  key={artist.id}
                                >
                                  {artist.name}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/*<div
                      className="item get-more"
                      onClick={() => {
                        handleGetMoreClicked("tracks", lists.next.tracks);
                      }}
                    >
                      <p>Get more</p>
                    </div>*/}
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
                          {r.images[0] ? (
                            <img src={r.images[0].url} alt="Artist token" />
                          ) : null}
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
                        <button className="btn btn-primary">See more</button>
                      </div>
                    ))}
                    <div></div>
                  </div>
                </div>
                <div className="list-container">
                  <p>Artists</p>
                  <div className="list">
                    {lists.artists.map(r => (
                      <div
                        className="item clickable"
                        key={r.id}
                        onClick={() => {
                          handleArtistClicked(r.id);
                        }}
                      >
                        <div className="img-container">
                          {r.images[0] ? (
                            <img src={r.images[0].url} alt="Artist token" />
                          ) : null}
                        </div>
                        <p className="name">{r.name}</p>
                        <div className="description">
                          <p>Popularity: {r.popularity}</p>
                        </div>
                        <button className="btn btn-primary">See more</button>
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
