import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button, Spinner } from "reactstrap";

import { handleMoreInfo } from "./../../spotifyAPI";

import "./styles.scss";

const MoreInfo = ({ moreInfo, favoritedSongs, dispatch }) => {
  useEffect(() => {
    if (moreInfo.open) {
      if (moreInfo.loading) getMoreInfo();
    }
  }, [moreInfo]);

  function closeMoreInfo() {
    dispatch({
      type: "SET_MOREINFO",
      open: false
    });
  }
  function toggleFavoritedSong(songID) {
    dispatch({ type: "TOGGLE_SONG_FAVORITED", songID });
  }

  async function getMoreInfo() {
    let itemType;

    if (moreInfo.type === "track") {
      itemType = "albums";
    } else {
      itemType = `${moreInfo.type}s`;
    }

    await handleMoreInfo(moreInfo.itemId, itemType)
      .then(r => {
        dispatch({
          type: "SET_MOREINFO",
          open: true,
          loading: false,
          response: r,
          itemId: moreInfo.itemId,
          typeGet: moreInfo.type
        });
      })
      .catch(r => {});
  }

  function getMoreAgain(itemId, typeGet) {
    dispatch({
      type: "SET_MOREINFO",
      open: true,
      itemId: itemId,
      loading: true,
      typeGet
    });
  }

  let filledHeart =
    "M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z";

  let borderHeart =
    "M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181";

  return (
    <div id="MoreInfo" className={moreInfo.open ? "" : "hidden"}>
      {moreInfo.loading ? (
        <div className="loading-message">
          <p>Loading</p>
          <Spinner color="light" />
        </div>
      ) : (
        <>
          <div className="more-info-header">
            <div className="img-container">
              <img
                src={
                  moreInfo.response[0].images[0]
                    ? moreInfo.response[0].images[0].url
                    : null
                }
                alt="item-img"
              />
            </div>
            {moreInfo.type === "artist" ? null : (
              <div className="artists">
                {moreInfo.response[0].artists.map(artist => (
                  <p
                    key={artist.id}
                    className="link"
                    onClick={() => {
                      getMoreAgain(artist.id, "artist");
                    }}
                  >
                    {artist.name}
                  </p>
                ))}
              </div>
            )}
            <p className="title">{moreInfo.response[0].name}</p>
          </div>
          <div className="more-info-body">
            {moreInfo.type === "artist" ? (
              <div className="albums-artists-list">
                <p className="tile">Albums</p>
                <div className="album-list">
                  {moreInfo.response[1].items.map(album => (
                    <div key={album.id} className="album">
                      <div className="img-container">
                        <img
                          src={album.images[0] ? album.images[0].url : null}
                          alt="item-img"
                        />
                      </div>
                      <p className="title">{album.name}</p>
                      <div className="see-more-container">
                        <Button
                          color="secondary"
                          onClick={() => getMoreAgain(album.id, "album")}
                        >
                          See More
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="more-album-track-list">
                {moreInfo.response[0].tracks.items.map(track => {
                  return (
                    <div
                      className={
                        moreInfo.type === "track"
                          ? moreInfo.itemId === track.id
                            ? "track ACTIVE"
                            : `track`
                          : "track"
                      }
                      key={track.id}
                    >
                      <div className="index">
                        <p>{track.track_number}</p>
                      </div>
                      <div className="favorite-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          onClick={() => {
                            toggleFavoritedSong(track.id);
                          }}
                        >
                          <path
                            d={
                              favoritedSongs.includes(track.id)
                                ? filledHeart
                                : borderHeart
                            }
                          />
                        </svg>
                      </div>
                      <div className="track-name">
                        <p>{track.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      <div className="more-info-footer">
        <Button onClick={closeMoreInfo}>Close</Button>
      </div>
    </div>
  );
};

export default connect(state => ({
  moreInfo: state.moreInfo,
  favoritedSongs: state.favoritedSongs
}))(MoreInfo);
