import style from "./Trending.module.css";
import { SlMagnifier } from "react-icons/sl";
import { useLocation } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { useRef, useEffect, useState } from "react";
const SearchBar = ({ setPosts }) => {
  const input = useRef();

  const [GenreBox, setGenreBox] = useState(false);
  const [genrePredicts, setGenrePredicts] = useState([]);
  const [genre, setGenre] = useState(null);
  const genreDropBox = useRef();

  const [instrumentBox, setInstrumentBox] = useState(false);
  const [instrumentPredicts, setInstrumentPredicts] = useState([]);
  const [instrument, setInstrument] = useState(null);
  const instrumentDropBox = useRef();

  const [stateBox, setStateBox] = useState(false);
  const [statePredicts, setStatePredicts] = useState([]);
  const [state, setState] = useState(null);
  const stateDropBox = useRef();

  const [cityBox, setCityBox] = useState(false);
  const [cityPredicts, setCityPredicts] = useState([]);
  const [city, setCity] = useState(null);
  const cityDropBox = useRef();

  const [timeBox, setTimeBox] = useState(false);
  const [time, setTime] = useState(1);
  const timeDropBox = useRef();

  const remoteRef = useRef();

  const location = useLocation();

  const handleGetPosts = async () => {
    const data = await fetch("http://localhost:8000/getPosts", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
      body: JSON.stringify({
        search: input.current.value.trim(),
        genre: genre?.Gid,
        instrument: instrument?.Iid,
        time,
        state: state?.Sid,
        city: city?.Cid,
      }),
    });
    const json = await data.json();
    setPosts(json);
  };

  const handleGetJobPosts = async () => {
    const data = await fetch("http://localhost:8000/getJobPosts", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
      body: JSON.stringify({
        search: input.current.value.trim(),
        genre: genre?.Gid,
        instrument: instrument?.Iid,
        time,
        state: state?.Sid,
        city: city?.Cid,
        remote: remoteRef.current.checked,
      }),
    });
    const json = await data.json();
    setPosts(json);
  };

  useEffect(() => {
    if (location.pathname !== "/opportunities") {
      handleGetPosts();
    } else {
      handleGetJobPosts();
    }
  }, []);

  const handleGetGenrePredicts = async (e) => {
    if (e.target.value === "") {
      setGenrePredicts([]);
      return;
    }
    const data = await fetch(
      "http://localhost:8000/getGenrePredicts/" + e.target.value,
      { credentials: "include" }
    );
    const json = await data.json();
    setGenrePredicts(json);
  };

  const handleGetInstrumentPredicts = async (e) => {
    if (e.target.value === "") {
      setInstrumentPredicts([]);
      return;
    }
    const data = await fetch(
      "http://localhost:8000/getInstrumentPredict/" + e.target.value,
      { credentials: "include" }
    );
    const json = await data.json();
    setInstrumentPredicts(json);
  };

  const handleGetStatePredicts = async (e) => {
    if (e.target.value === "") {
      setStatePredicts([]);
      return;
    }
    const data = await fetch(
      "http://localhost:8000/getState/" + e.target.value,
      { credentials: "include" }
    );
    const json = await data.json();
    setStatePredicts(json);
  };

  const handleGetCityPredicts = async (e) => {
    if (e.target.value === "") {
      setCityPredicts([]);
      return;
    }
    const data = await fetch(
      "http://localhost:8000/getCity/" + e.target.value,
      { credentials: "include" }
    );
    const json = await data.json();
    setCityPredicts(json);
  };

  const timeCodeMeaning = () => {
    if (time === 1) {
      if (location.pathname === "/opportunities") return "24 hours";
      return "Trending Today";
    } else if (time === 2) {
      return "This week";
    } else if (time === 3) {
      return "This month";
    } else if (time === 4) {
      return "This year";
    } else {
      return "All time";
    }
  };
  return (
    <div className={style.search}>
      <div className={style.searchInputWrapper}>
        <input ref={input} type="text" className={style.searchInput} />
        <SlMagnifier
          onClick={() => {
            if (location.pathname !== "/opportunities") {
              handleGetPosts();
            } else {
              handleGetJobPosts();
            }
          }}
          className={style.searchInputIcon}
        />
      </div>
      <button
        ref={genreDropBox}
        className={style.dropBoxHeader}
        onFocus={() => setGenreBox(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setGenreBox(false);
            setGenrePredicts([]);
          }
        }}
      >
        {genre ? genre.genreName : "Genre"}
        <IoIosArrowDown />
        {GenreBox && (
          <div className={style.dropBox}>
            <input
              onKeyUp={(e) => handleGetGenrePredicts(e)}
              autoFocus
              type="text"
              className={style.dropBoxInput}
            />
            <div className={style.dropBoxOptions}>
              {genrePredicts.map((item) => {
                return (
                  <div
                    key={item.Gid}
                    tabIndex={0}
                    className={style.dropBoxOption}
                    onClick={() => {
                      setGenre(item);
                      setGenreBox(false);
                      setGenrePredicts([]);
                      genreDropBox.current.blur();
                    }}
                  >
                    {item.genreName}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </button>
      <button
        ref={instrumentDropBox}
        className={style.dropBoxHeader}
        onFocus={() => setInstrumentBox(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setInstrumentBox(false);
            setInstrumentPredicts([]);
          }
        }}
      >
        {instrument ? instrument.instrumentName : "Instrument"}
        <IoIosArrowDown />
        {instrumentBox && (
          <div className={style.dropBox}>
            <input
              onKeyUp={(e) => handleGetInstrumentPredicts(e)}
              autoFocus
              type="text"
              className={style.dropBoxInput}
            />
            <div className={style.dropBoxOptions}>
              {instrumentPredicts.map((item) => {
                return (
                  <div
                    key={item.Iid}
                    tabIndex={0}
                    className={style.dropBoxOption}
                    onClick={() => {
                      setInstrument(item);
                      setInstrumentBox(false);
                      setInstrumentPredicts([]);
                      instrumentDropBox.current.blur();
                    }}
                  >
                    {item.instrumentName}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </button>
      <button
        ref={stateDropBox}
        className={style.dropBoxHeader}
        onFocus={() => setStateBox(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setStateBox(false);
            setStatePredicts([]);
          }
        }}
      >
        {state ? state.stateName : "State"}
        <IoIosArrowDown />
        {stateBox && (
          <div className={style.dropBox}>
            <input
              onKeyUp={(e) => handleGetStatePredicts(e)}
              autoFocus
              type="text"
              className={style.dropBoxInput}
            />
            <div className={style.dropBoxOptions}>
              {statePredicts.map((item) => {
                return (
                  <div
                    key={item.Sid}
                    tabIndex={0}
                    className={style.dropBoxOption}
                    onClick={() => {
                      setState(item);
                      setStateBox(false);
                      setStatePredicts([]);
                      setCity(null);
                      stateDropBox.current.blur();
                    }}
                  >
                    {item.stateName}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </button>
      <button
        ref={cityDropBox}
        className={style.dropBoxHeader}
        onFocus={() => setCityBox(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setCityBox(false);
            setCityPredicts([]);
          }
        }}
      >
        {city ? city.cityName : "City"}
        <IoIosArrowDown />
        {cityBox && (
          <div className={style.dropBox}>
            <input
              onKeyUp={(e) => handleGetCityPredicts(e)}
              autoFocus
              type="text"
              className={style.dropBoxInput}
            />
            <div className={style.dropBoxOptions}>
              {cityPredicts.map((item) => {
                return (
                  <div
                    key={item.Cid}
                    tabIndex={0}
                    className={style.dropBoxOption}
                    onClick={() => {
                      setCity(item);
                      setCityBox(false);
                      setCityPredicts([]);
                      setState({ Sid: item.Sid, stateName: item.stateName });
                      cityDropBox.current.blur();
                    }}
                  >
                    {`${item.stateName}/${item.cityName}`}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </button>
      <button
        ref={timeDropBox}
        className={style.dropBoxHeader}
        onFocus={() => setTimeBox(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setTimeBox(false);
          }
        }}
      >
        {timeCodeMeaning()}
        <IoIosArrowDown />
        {timeBox && (
          <div className={style.dropBox}>
            <div className={style.dropBoxOptions}>
              <div
                tabIndex={0}
                className={style.dropBoxOption}
                onClick={() => {
                  setTime(1);
                  setTimeBox(false);
                  timeDropBox.current.blur();
                }}
              >
                {location.pathname !== "/opportunities"
                  ? "Trending Today"
                  : "24 hours"}
              </div>
              <div
                tabIndex={0}
                className={style.dropBoxOption}
                onClick={() => {
                  setTime(2);
                  setTimeBox(false);
                  timeDropBox.current.blur();
                }}
              >
                {"This week"}
              </div>
              <div
                tabIndex={0}
                className={style.dropBoxOption}
                onClick={() => {
                  setTime(3);
                  setTimeBox(false);
                  timeDropBox.current.blur();
                }}
              >
                {"This month"}
              </div>
              {location.pathname !== "/opportunities" && (
                <>
                  <div
                    tabIndex={0}
                    className={style.dropBoxOption}
                    onClick={() => {
                      setTime(4);
                      setTimeBox(false);
                      timeDropBox.current.blur();
                    }}
                  >
                    {"This year"}
                  </div>
                  <div
                    tabIndex={0}
                    className={style.dropBoxOption}
                    onClick={() => {
                      setTime(5);
                      setTimeBox(false);
                      timeDropBox.current.blur();
                    }}
                  >
                    {"All Time"}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </button>
      {location.pathname === "/opportunities" && (
        <label htmlFor="remote" className={style.remoteCheckWrapper}>
          <input id="remote" ref={remoteRef} type="checkbox" />
          
          remote
        </label>
      )}
    </div>
  );
};
export default SearchBar;
