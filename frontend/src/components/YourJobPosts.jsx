import { FaPlus } from "react-icons/fa6";
import style from "./Opportunities.module.css";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import JobPost from "./JobPost";

const YourJobPosts = () => {
  const [error, setError] = useState(null);
  const [flag, setFlag] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationFocus, setLocationFocus] = useState(false);
  const [locationPredicts, setLocationPredicts] = useState([]);
  const locationInput = useRef();

  const [genres, setGenres] = useState([]);
  const [genrePredicts, setGenrePredicts] = useState([]);
  const [genreSet, setGenreSet] = useState(new Set());
  const [genreFocus, setGenreFocus] = useState(false);
  const genreInput = useRef();

  const [instruments, setInstruments] = useState([]);
  const [instrumentPredicts, setInstrumentPredicts] = useState([]);
  const [instrumentSet, setInstrumentSet] = useState(new Set());
  const [instrumentFocus, setInstrumentFocus] = useState(false);
  const instrumentInput = useRef();

  const titleInput = useRef();
  const jobTypeInput = useRef();
  const paymentInput = useRef();
  const jobDescInput = useRef();
  const respInput = useRef();
  const reqInput = useRef();
  const remote = useRef();

  const [yourPosts, setYourPosts] = useState([]);
  useEffect(() => {
    const getYourPosts = async () => {
      const data = await fetch("http://localhost:8000/getYourJobPosts", {
        credentials: "include",
      });
      const json = await data.json();

      setYourPosts(json);
    };
    getYourPosts();
  }, []);

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

  const handleGetCities = async (word) => {
    if (word === "") {
      setLocationPredicts([]);
      return;
    }
    const data = await fetch("http://localhost:8000/getCity/" + word, {
      credentials: "include",
    });
    const json = await data.json();
    setLocationPredicts(json);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!titleInput.current || titleInput.current.value.trim() === "") {
      setError({ id: 1, message: "Enter the title" });
      return;
    }
    if (!jobTypeInput.current || jobTypeInput.current.value.trim() === "") {
      setError({ id: 2, message: "Enter the job type" });
      return;
    }
    if (!paymentInput.current || paymentInput.current.value.trim() === "") {
      setError({ id: 3, message: "Enter the payment details" });
      return;
    }
    if (!location) {
      setError({ id: 4, message: "Enter the location" });
      return;
    }
    if (genres.length === 0) {
      setError({ id: 5, message: "Enter the genres related to post" });
      return;
    }
    if (instruments.length === 0) {
      setError({ id: 6, message: "Enter the instruments related to post" });
      return;
    }
    if (!jobDescInput.current || jobDescInput.current.value.trim() === "") {
      setError({ id: 7, message: "Enter the job description" });
      return;
    }
    if (!respInput.current || respInput.current.value.trim() === "") {
      setError({ id: 8, message: "Enter the responsibilities of the job" });
      return;
    }
    if (!reqInput.current || reqInput.current.value.trim() === "") {
      setError({ id: 9, message: "Enter the requirements for the job" });
      return;
    }

    const data = await fetch("http://localhost:8000/makeJobPost", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
      body: JSON.stringify({
        title: titleInput.current.value,
        remote: remote.current.checked,
        payment: paymentInput.current.value,
        jobType: jobTypeInput.current.value,
        location: location.Cid,
        genres,
        instruments,
        requirements: reqInput.current.value,
        responsibilities: respInput.current.value,
        jobDesc: jobDescInput.current.value,
      }),
    });
    const json = await data.json();
    setYourPosts((prev) => {
      return [{data:json,instrument:instruments,genre:genres,applicants:[]}, ...prev];
    });
    setFlag(false);
    setGenres([]);
    setGenrePredicts([]);
    setGenreSet(new Set());
    setInstruments([]);
    setInstrumentPredicts([]);
    setInstrumentSet(new Set());
    setLocation(null)
  };

  return (
    <div className={style.yourJobPosts}>
      {!flag && (
        <>
          <div className={style.wrapper}>
            <div
              onClick={() => {
                setFlag(true);
              }}
              className={style.addButton}
            >
              <FaPlus className={style.addButtonIcon} />
            </div>
            {yourPosts.map((item) => {
              return <JobPost key={item.data.Jid} data={item} />;
            })}
          </div>
        </>
      )}
      {flag && (
        <div className={style.addPostWrapper}>
          <div
            onClick={() => {
              setFlag(false);
              setGenres([]);
              setGenrePredicts([]);
              setGenreSet(new Set());
              setInstruments([]);
              setInstrumentPredicts([]);
              setInstrumentSet(new Set());
              setLocation(null)
            }}
            className={style.back}
          >
            <FaArrowLeft className={style.backIcon} />
          </div>
          <div className={style.addSubTitle}>Title:</div>
          <textarea
            ref={titleInput}
            placeholder=""
            rows={1}
            className={`${style.input} ${
              error && error.id === 1 ? style.errorBorder : ""
            }`}
          ></textarea>
          <div className={style.addSubTitle}>Job Type:</div>
          <textarea
            ref={jobTypeInput}
            placeholder="e.g., Freelance / Contract"
            rows={1}
            className={`${style.input} ${
              error && error.id === 2 ? style.errorBorder : ""
            }`}
          ></textarea>
          <div className={style.addSubTitle}>Payment:</div>
          <textarea
            ref={paymentInput}
            placeholder="e.g., ₹5,000 per track (negotiable based on experience)"
            rows={1}
            className={`${style.input} ${
              error && error.id === 3 ? style.errorBorder : ""
            }`}
          ></textarea>
          <div className={style.addSubTitle}>Location:</div>
          <button
            ref={locationInput}
            className={`${style.locationHeader} ${
              error && error.id === 4 ? style.errorBorder : ""
            }`}
            onFocus={() => setLocationFocus(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setLocationFocus(false);
                setLocationPredicts([]);
              }
            }}
          >
            <div>
              {location
                ? location.stateName + " / " + location.cityName
                : "location"}
            </div>
            <div>
              <MdKeyboardArrowDown className={style.downArrow} />
            </div>
            {locationFocus && (
              <div className={style.dropBox}>
                <input
                  onKeyUp={(e) => handleGetCities(e.target.value)}
                  type="text"
                  className={style.locationInput}
                  autoFocus
                />
                <div className={style.locationPredicts}>
                  {locationPredicts.map((item) => {
                    return (
                      <button
                        tabIndex="0"
                        onClick={() => {
                          setLocation(item);
                          setLocationPredicts([]);
                          setLocationFocus(false);
                          locationInput.current.blur();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setLocation(item);
                            setLocationPredicts([]);
                            setLocationFocus(false);
                            locationInput.current.blur();
                          }
                        }}
                        className={style.locationPredict}
                        key={item.Cid}
                      >
                        {item.stateName} / {item.cityName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </button>
          <div className={style.addSubTitle}>Genres:</div>
          <div
            className={`${style.tagWrapper} ${
              error && error.id === 5 ? style.errorBorder : ""
            }`}
          >
            {genres.map((item) => {
              return (
                <div className={style.tag} key={item.Gid}>
                  {item.genreName}
                  <RxCross2
                    onClick={() => {
                      setGenreSet((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(item.Gid);
                        return newSet;
                      });
                      setGenres((prev) => {
                        return prev.filter((item2) => {
                          return item.Gid != item2.Gid;
                        });
                      });
                    }}
                    className={style.cross}
                  />
                </div>
              );
            })}
            <div className={style.tagInputWrapper}>
              <input
                autoFocus
                onFocus={() => setGenreFocus(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setGenreFocus(false);
                    setGenrePredicts([]);
                  }
                }}
                ref={genreInput}
                onKeyUp={(e) => getGenrePredicts(e.target.value)}
                type="text"
                className={style.tagInput}
              />
              {genreFocus && (
                <div className={style.predicts}>
                  {genrePredicts.map((item) => {
                    return !genreSet.has(item.Gid) ? (
                      <button
                        tabIndex="0"
                        key={item.Gid}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setGenres((prev) => {
                            return [...prev, item];
                          });
                          setGenreSet((prev) => {
                            const newSet = new Set(prev);
                            newSet.add(item.Gid);
                            return newSet;
                          });
                          setGenrePredicts([]);
                          genreInput.current.value = "";
                          genreInput.current.focus();
                        }}
                        className={style.predict}
                      >
                        {item.genreName}
                      </button>
                    ) : (
                      ""
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className={style.addSubTitle}>Instruments:</div>
          <div
            className={`${style.tagWrapper} ${
              error && error.id === 6 ? style.errorBorder : ""
            }`}
          >
            {instruments.map((item) => {
              return (
                <div className={style.tag} key={item.Iid}>
                  {item.instrumentName}
                  <RxCross2
                    onClick={() => {
                      setInstrumentSet((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(item.Gid);
                        return newSet;
                      });
                      setInstruments((prev) => {
                        return prev.filter((item2) => {
                          return item.Iid != item2.Iid;
                        });
                      });
                    }}
                    className={style.cross}
                  />
                </div>
              );
            })}
            <div className={style.tagInputWrapper}>
              <input
                autoFocus
                onFocus={() => setInstrumentFocus(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setInstrumentFocus(false);
                    setInstrumentPredicts([]);
                  }
                }}
                ref={instrumentInput}
                onKeyUp={(e) => getInstrumentPredicts(e.target.value)}
                type="text"
                className={style.tagInput}
              />
              {instrumentFocus && (
                <div className={style.predicts}>
                  {instrumentPredicts.map((item) => {
                    return !instrumentSet.has(item.Iid) ? (
                      <button
                        tabIndex="0"
                        key={item.Iid}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setInstruments((prev) => {
                            return [...prev, item];
                          });
                          setInstrumentSet((prev) => {
                            const newSet = new Set(prev);
                            newSet.add(item.Iid);
                            return newSet;
                          });
                          setInstrumentPredicts([]);
                          instrumentInput.current.value = "";
                          instrumentInput.current.focus();
                        }}
                        className={style.predict}
                      >
                        {item.instrumentName}
                      </button>
                    ) : (
                      ""
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={style.addSubTitle}>Job Description:</div>
          <textarea
            ref={jobDescInput}
            placeholder="e.g., Record electric/acoustic guitar parts, collaborate on compositions..."
            rows={3}
            className={`${style.input} ${
              error && error.id === 7 ? style.errorBorder : ""
            }`}
          ></textarea>
          <div className={style.addSubTitle}>Responsibilities:</div>
          <textarea
            ref={respInput}
            placeholder="e.g., Record electric/acoustic guitar parts for multiple tracks..."
            rows={3}
            className={`${style.input}  ${
              error && error.id === 8 ? style.errorBorder : ""
            }`}
          ></textarea>
          <div className={style.addSubTitle}>Requirements:</div>
          <textarea
            ref={reqInput}
            placeholder="e.g., Proficiency in Bollywood, Fusion, Jazz/Blues guitar styles..."
            rows={3}
            className={`${style.input} ${
              error && error.id === 9 ? style.errorBorder : ""
            }`}
          ></textarea>
          <div className={style.horizontalAlign}>
            <label className={style.container}>
              Is the job remote
              <input ref={remote} type="checkbox" />
              <span className={style.checkmark}></span>
            </label>
            <div onClick={handleSubmit} className={style.submit}>
              Submit
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default YourJobPosts;
