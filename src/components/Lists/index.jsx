import React, { useState } from "react";
import { connect } from "react-redux";
import { Button } from "reactstrap";

import { handleGetMore } from "./../../spotifyAPI";
import List from "./../List";

import "./styles.scss";

const ItemsList = ({ lists, completed, favoritedSongs, dispatch }) => {
  let [error, setError] = useState(false);
  function setMoreInfo(item, typeGet) {
    let itemId;
    if (typeGet === "track") {
      itemId = item.album.id;
    } else {
      itemId = item.id;
    }
    return {
      type: "SET_MOREINFO",
      itemId,
      typeGet,
      open: true,
      loading: true
    };
  }
  function toggleFavoritedSong(songID) {
    dispatch({ type: "TOGGLE_SONG_FAVORITED", songID });
  }

  function moreInfo(item, type) {
    dispatch(setMoreInfo(item, type));
  }

  async function getMore(query, type) {
    await handleGetMore(query)
      .then(r => {
        dispatch({
          type: `ADD_${type.toUpperCase()}`,
          items: r[type].items,
          next: r[type].next
        });
      })
      .catch(error => {
        setError(true);
      });
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return (
    <div id="lists" className={completed ? "" : "hidden"}>
      {error ? (
        <>
          <div className="list-container">
            <p className="title">Tracks</p>
            <div className="list">
              <List
                type="track"
                items={lists.tracks.items}
                next={() => getMore(lists.tracks.next, "tracks")}
                moreInfo={moreInfo}
                favoritedSongs={favoritedSongs}
                toggleFavoritedSong={toggleFavoritedSong}
              />
            </div>
          </div>

          <div className="list-container">
            <p className="title">Albums</p>
            <div className="list">
              <List
                type="album"
                items={lists.albums.items}
                next={() => getMore(lists.albums.next, "albums")}
                moreInfo={moreInfo}
              />
            </div>
          </div>
          <div className="list-container">
            <p className="title">Artists</p>
            <div className="list">
              <List
                type="artist"
                items={lists.artists.items}
                next={() => getMore(lists.artists.next, "artists")}
                moreInfo={moreInfo}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="error">
            <p>
              Some error has occurred.
              <br /> Check your internet connection and try again
              <br /> If this error persists please try to logout and sign in
              again
            </p>
            <Button color="primary" onClick={logout}>
              Logout
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default connect(state => ({
  lists: {
    tracks: state.tracks,
    albums: state.albums,
    artists: state.artists
  },
  completed: state.completed,
  favoritedSongs: state.favoritedSongs
}))(ItemsList);
