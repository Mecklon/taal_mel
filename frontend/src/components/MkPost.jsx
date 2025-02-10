import style from "./MkPost.module.css";
import def from "../assets/default-image.jpg";
import { useAuthContext } from "../hooks/useAuthContext";
import { useEffect, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import rolling from "../assets/rolling.gif";
import { useNavigate } from "react-router-dom";
const MkPost = () => {
  const { profData } = useAuthContext();
  const [instrument, setInstrument] = useState(profData.instrument);
  const [genre, setGenre] = useState(profData.genre);
  const instrumentSet = useRef(new Set());
  const genreSet = useRef(new Set());
  const [genrePredicts, setGenrePredicts] = useState([]);
  const [instrumentPredicts, setInstrumentPredicts] = useState([]);
  const instrumentInput = useRef();
  const genreInput = useRef();
  const instrumentInputRef = useRef();
  const genreInputRef = useRef();
  const [file, setFile] = useState(null);
  const fileType = useRef();
  const fileName = useRef();
  const media = useRef();
  const title = useRef();
  const desc = useRef();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    instrument.forEach((item) => {
      instrumentSet.current.add(item.Iid);
    });
    genre.forEach((item) => {
      genreSet.current.add(item.Gid);
    });
  }, []);

  const removeGenre = (Gid) => {
    setGenre((prev) => prev.filter((item) => item.Gid !== Gid));
    genreSet.current.delete(Gid);
  };

  const addGenre = (item) => {
    setGenre((prev) => [...prev, item]);
    setGenrePredicts([]);
    genreSet.current.add(item.Gid);
    genreInput.current.value = "";
  };

  const removeInstrument = (Iid) => {
    setInstrument((prev) => prev.filter((item) => item.Iid !== Iid));
    instrumentSet.current.delete(Iid);
  };

  const addInstrument = (item) => {
    setInstrument((prev) => [...prev, item]);
    setInstrumentPredicts([]);
    instrumentSet.current.add(item.Iid);
    instrumentInput.current.value = "";
  };

  const getGenrePredicts = async (word) => {
    if (word === "") {
      setGenrePredicts([]);
      return;
    }
    const data = await fetch(`http://localhost:8000/getGenrePredicts/${word}`, {
      credentials: "include",
    });
    const json = await data.json();
    setGenrePredicts(json);
  };

  const getInstrumentPredicts = async (word) => {
    if (word === "") {
      setInstrumentPredicts([]);
      return;
    }
    const data = await fetch(
      `http://localhost:8000/getInstrumentPredict/${word}`,
      { credentials: "include" }
    );
    const json = await data.json();
    setInstrumentPredicts(json);
  };

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(URL.createObjectURL(e.target.files[0]));
      fileType.current = e.target.files[0].type;
      fileName.current = e.target.files[0].name;
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    if (!media.current.files[0]) {
      setError({ id: 1, message: "Select a media file" });
      return;
    } else if (!title.current || title.current.value.trim() === "") {
      setError({ id: 2, message: "Add a title for the post" });
      return;
    } else if (instrument.length === 0) {
      setError({ id: 3, message: "Add a instrument related to the post" });
      return;
    } else if (genre.length === 0) {
      setError({ id: 4, message: "Add genres related to the post" });
      return;
    }
    const formData = new FormData();

    formData.append("file", media.current.files[0]);
    formData.append("title", title.current.value.trim());
    formData.append("desc", desc.current.value.trim() || "");
    formData.append("genre", JSON.stringify(genre));
    formData.append("instrument", JSON.stringify(instrument));

    const data = await fetch("http://localhost:8000/newPost", {
      credentials: "include",
      method: "post",
      body: formData,
    });
    const json = await data.json();
    setLoading(false);
    navigate("/profile");
  };
  return (
    <div className={style.MkPost}>
      <label htmlFor="file">
        {!file ? (
          <img src={def} className={style.media}></img>
        ) : fileType.current.startsWith("image/") ? (
          <img src={file} className={style.media}></img>
        ) : fileType.current.startsWith("video/") ? (
          <video src={file} className={style.media}></video>
        ) : (
          <audio src={file} className={style.audio}></audio>
        )}
        <div className={style.name}>
          {fileName.current ? fileName.current : ""}
        </div>
      </label>
      <div className={style.errorWrapper}>
        <input
          onChange={onImageChange}
          type="file"
          id="file"
          ref={media}
          className={style.file}
        />
        {error && error.id === 1 && (
          <div style={{ top: "-40px" }} className={style.error}>
            {error.message}
          </div>
        )}
      </div>
      <div className={style.errorWrapper}>
        <input
          type="text"
          placeholder="Title"
          ref={title}
          className={style.titleInput}
        />
        {error && error.id === 2 && (
          <div style={{ bottom: "20px" }} className={style.error}>
            {error.message}
          </div>
        )}
      </div>
      <div className={style.errorWrapper}>
        <textarea
          ref={desc}
          placeholder="Description"
          className={style.descInput}
        ></textarea>
      </div>
      <div className={style.errorWrapper}>
        <div className={style.fieldTitle}>Instrumets:</div>
        {error && error.id === 3 && (
          <div style={{ bottom: "-10px" }} className={style.error}>
            {error.message}
          </div>
        )}
      </div>
      <div className={style.tags}>
        {instrument.map((item) => {
          return (
            <div key={item.Iid} className={style.tag}>
              {item.instrumentName}{" "}
              <RxCross2 onClick={() => removeInstrument(item.Iid)} />
            </div>
          );
        })}

        <div className={style.tagWrapper} ref={instrumentInputRef}>
          <input
            type="text"
            onBlur={(e) => {
              if (!instrumentInputRef.current.contains(e.relatedTarget)) {
                setInstrumentPredicts([]);
                e.target.value = "";
              }
            }}
            onKeyUp={(e) => getInstrumentPredicts(e.target.value)}
            className={style.tagInput}
            ref={instrumentInput}
          />
          {instrumentPredicts.length > 0 && (
            <div className={style.predicts}>
              {instrumentPredicts.map((item) =>
                !instrumentSet.current.has(item.Iid) ? (
                  <div
                    key={item.Iid}
                    tabIndex={0}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addInstrument(item);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addInstrument(item);
                        instrumentInput.current.focus();
                      }
                    }}
                    className={style.predict}
                  >
                    {item.instrumentName}
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
      <div className={style.errorWrapper}>
        <div className={style.fieldTitle}>Genres:</div>
        {error && error.id === 4 && (
          <div style={{ bottom: "-10px" }} className={style.error}>
            {error.message}
          </div>
        )}
      </div>
      <div className={style.tags}>
        {genre.map((item) => {
          return (
            <div key={item.Gid} className={style.tag}>
              {item.genreName}{" "}
              <RxCross2 onClick={() => removeGenre(item.Gid)} />
            </div>
          );
        })}
        <div className={style.tagWrapper} ref={genreInputRef}>
          <input
            type="text"
            onBlur={(e) => {
              if (!genreInputRef.current.contains(e.relatedTarget)) {
                setGenrePredicts([]);
                e.target.value = "";
              }
            }}
            onKeyUp={(e) => getGenrePredicts(e.target.value)}
            className={style.tagInput}
            ref={genreInput}
          />
          {genrePredicts.length > 0 && (
            <div className={style.predicts}>
              {genrePredicts.map((item) =>
                !genreSet.current.has(item.Gid) ? (
                  <div
                    className={style.predict}
                    key={item.Gid}
                    tabIndex={0}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addGenre(item);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addGenre(item);
                        genreInput.current.focus();
                      }
                    }}
                  >
                    {item.genreName}
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
      <button
        disabled={loading}
        onClick={handleSubmit}
        className={style.submit}
      >
        Post
        {loading && <img className={style.rolling} src={rolling} alt="" />}
      </button>
    </div>
  );
};
export default MkPost;
