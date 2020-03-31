import React, { useState } from "react";
import { Input, Button } from "reactstrap";
import { connect } from "react-redux";

import "./styles.scss";
import { search } from "../../spotifyAPI";

const SearchBar = ({ completed, searched, dispatch }) => {
  let [searchInput, setSeachInput] = useState("");

  function setArtists(artists, next) {
    return {
      type: "SET_ARTISTS",
      items: artists,
      next
    };
  }
  function setTracks(tracks, next) {
    return {
      type: "SET_TRACKS",
      items: tracks,
      next
    };
  }
  function setAlbums(albums, next) {
    return {
      type: "SET_ALBUMS",
      items: albums,
      next
    };
  }

  function setSearch() {
    return {
      type: "SET_SEARCHED",
      seached: searchInput
    };
  }

  function setCompleted(completed) {
    return {
      type: "SET_COMPLETED",
      completed
    };
  }

  async function handleSearch() {
    dispatch(setCompleted(false));

    if (searchInput === "") {
      alert("Search input is empty");
      return;
    }

    if (searchInput !== searched) {
      dispatch(setSearch());
      await search(searchInput)
        .then(r => {
          dispatch(setTracks(r.tracks.items, r.tracks.next));
          dispatch(setArtists(r.artists.items, r.artists.next));
          dispatch(setAlbums(r.albums.items, r.albums.next));
        })
        .catch(error => {});
    }
    dispatch(setCompleted(true));
  }

  function handleChangeInput(text) {
    setSeachInput(text);
    if (completed) dispatch(setCompleted(false));
  }

  return (
    <div id="search-bar">
      <div>
        <Input
          placeholder="Search for a music, artists and album"
          value={searchInput}
          onChange={e => handleChangeInput(e.target.value)}
          onKeyPress={event => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button color="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>
    </div>
  );
};

export default connect(state => ({
  completed: state.completed,
  searched: state.searched
}))(SearchBar);
