import React from "react";
import { Button } from "reactstrap";

import "./styles.scss";

const List = props => {
  const getImage = item => {
    let imageArray = props.type === "track" ? item.album.images : item.images;
    return imageArray;
  };

  let filledHeart =
    "M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z";

  let borderHeart =
    "M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181";

  return (
    <div className="list">
      {props.items.map(item => {
        let image = getImage(item)[0] ? getImage(item)[0].url : null;
        return (
          <div className={`item ${props.type}`} key={item.id}>
            <div className="img-container">
              {image ? <img src={image} alt="item-img" /> : null}
              {props.type === "track" ? (
                <div className="favorite-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    onClick={() => {
                      props.toggleFavoritedSong(item.id);
                    }}
                  >
                    <path
                      d={
                        props.favoritedSongs.includes(item.id)
                          ? filledHeart
                          : borderHeart
                      }
                    />
                  </svg>
                </div>
              ) : null}
            </div>
            <div className="description">
              <p className="name">{item.name}</p>
              {props.type === "track" ? (
                <div className="artists">
                  <p>Artist{item.artists.length <= 1 ? "" : "s"}:</p>
                  {item.artists.map(artist => (
                    <p key={artist.id} className="link">
                      {artist.name}
                    </p>
                  ))}
                </div>
              ) : null}
              <div className="see-more-container">
                <Button
                  color="secondary"
                  onClick={() => props.moreInfo(item, props.type)}
                >
                  See More
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      <div className={`item ${props.type} next`} onClick={() => props.next()}>
        <div className="container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
          </svg>
          <p>Get more</p>
        </div>
      </div>
    </div>
  );
};

export default List;
