import { createStore } from "redux";

const INITIAL_STATE = {
  searched: "",
  completed: false,
  searchError: false,
  tracks: {
    items: [],
    next: "",
  },
  artists: {
    items: [],
    next: "",
  },
  albums: {
    items: [],
    next: "",
  },
  favoritedSongs: JSON.parse(localStorage.getItem("favoritedSongs")) || [],
  moreInfo: {
    open: false,
    itemId: "",
    type: "",
    loading: true,
    response: {},
  },
};

function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "SET_ALBUMS":
      return { ...state, albums: { items: action.items, next: action.next } };

    case "SET_ARTISTS":
      return { ...state, artists: { items: action.items, next: action.next } };

    case "SET_TRACKS":
      return { ...state, tracks: { items: action.items, next: action.next } };

    case "ADD_ALBUMS":
      let albumsConcat = state.albums.items.concat(action.items);
      return { ...state, albums: { items: albumsConcat, next: action.next } };

    case "ADD_ARTISTS":
      let artistsConcat = state.artists.items.concat(action.items);
      return { ...state, artists: { items: artistsConcat, next: action.next } };

    case "ADD_TRACKS":
      let tracksConcat = state.tracks.items.concat(action.items);
      return { ...state, tracks: { items: tracksConcat, next: action.next } };

    case "SET_COMPLETED":
      return { ...state, completed: action.completed };
    case "SET_SEARCHERROR":
      return { ...state, searchError: action.searchError };

    case "SET_SEARCHED":
      return { ...state, searched: action.searched };

    case "TOGGLE_SONG_FAVORITED": {
      let favoritedSongs = state.favoritedSongs;
      if (favoritedSongs.includes(action.songID)) {
        favoritedSongs = favoritedSongs.filter(
          (song) => song !== action.songID
        );
      } else {
        favoritedSongs = [...favoritedSongs, action.songID];
      }
      localStorage.setItem("favoritedSongs", JSON.stringify(favoritedSongs));
      return { ...state, favoritedSongs };
    }

    case "SET_MOREINFO": {
      let moreInfo;
      if (action.open) {
        moreInfo = {
          itemId: action.itemId,
          type: action.typeGet,
          loading: action.loading,
          response: action.response,
          open: true,
        };
      } else {
        moreInfo = { ...state.moreInfo, open: false };
      }
      return { ...state, moreInfo };
    }
    default:
      return state;
  }
}

const store = createStore(reducer);

export default store;
