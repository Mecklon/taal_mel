import Defimg2 from "../assets/wallhaven-j3w6om.jpg";
import Defimg from "../assets/defaultAvatar.png";
import style from "./Profile.module.css";
import { Link, useLocation } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { IoCheckmarkSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { LuPlus } from "react-icons/lu";
import socket from "./Socket";
import { ImCross } from "react-icons/im";
import ConfirmationBox from "./ConfirmationBox";
import { IoMdPersonAdd } from "react-icons/io";

const Profile = () => {
  const [settings, setSettings] = useState(false);
  const { setUser, profData, setProfData } = useAuthContext();
  const [edit, setEdit] = useState(false);
  const image = useRef();
  const image2 = useRef();
  const [img, setImg] = useState(null);
  const [img2, setImg2] = useState(null);
  const bio = useRef();
  const [removedInstrument, setRemovedInstrument] = useState(new Set());
  const [removedGenre, setRemovedGenre] = useState(new Set());
  const [addedInstrument, setAddedInstrument] = useState(new Set());
  const [addedGenre, setAddedGenre] = useState(new Set());
  const [addInstrument, setAddInstrument] = useState(false);
  const [addGenre, setAddGenre] = useState(false);
  const [instrumentPredicts, setInstrumentPredicts] = useState([]);
  const [genrePredicts, setGenrePredicts] = useState([]);
  const instrumentInput = useRef();
  const genreInput = useRef();
  const existingInstrument = useRef(new Set());
  const existingGenre = useRef(new Set());
  const [posts, setPosts] = useState([]);
  const [locationFocus, setLocationFocus] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const locationInput = useRef();
  const location = useLocation();
  const [userData, setUserData] = useState(profData);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const getPost = async () => {
      if (location.state) {
        const data = await fetch("http://localhost:8000/getProfData", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          method: "post",
          body: JSON.stringify({
            email: location.state,
          }),
        });
        const json = await data.json();

        setUserData(json);
      }

      const data = await fetch(
        "http://localhost:8000/getProfilePosts/" +
          (location.state ? location.state : profData.email),
        {
          credentials: "include",
        }
      );
      const json = await data.json();
      setPosts(json);
    };
    getPost();
  }, []);

  const onImageChange2 = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImg2(URL.createObjectURL(e.target.files[0]));
    }
  };
  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImg(URL.createObjectURL(e.target.files[0]));
    }
  };

  useEffect(() => {
    setRemovedGenre(new Set());
    setRemovedInstrument(new Set());
    setAddInstrument(false);
    setAddGenre(false);
  }, [edit]);

  useEffect(() => {
    if (edit) {
      existingInstrument.current.clear();
      userData.instrument.forEach((item) =>
        existingInstrument.current.add(item.Iid)
      );
      existingGenre.current.clear();
      userData.genre.forEach((item) => existingGenre.current.add(item.Gid));
      return;
    }
    userData.instrument.forEach((item) =>
      existingInstrument.current.add(item.Iid)
    );
    userData.genre.forEach((item) => existingGenre.current.add(item.Gid));
  }, [edit, userData]);

  const toggleGenre = (Gid) => {
    setRemovedGenre((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(Gid)) {
        newSet.delete(Gid);
      } else {
        newSet.add(Gid);
      }
      return newSet;
    });
  };

  const toggleInstrument = (Iid) => {
    setRemovedInstrument((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(Iid)) {
        newSet.delete(Iid);
      } else {
        newSet.add(Iid);
      }
      return newSet;
    });
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
  const handleAddInstrument = (item) => {
    setUserData((prev) => {
      return { ...prev, instrument: [...prev.instrument, item] };
    });
    setAddedInstrument((prev) => {
      const newSet = new Set(prev);
      newSet.add(item.Iid);
      return newSet;
    });
    instrumentInput.current.value = "";
    setInstrumentPredicts([]);
    instrumentInput.current.focus();
  };
  const handleAddGenre = (item) => {
    setUserData((prev) => {
      return { ...prev, genre: [...prev.genre, item] };
    });
    setAddedGenre((prev) => {
      const newSet = new Set(prev);
      newSet.add(item.Gid);
      return newSet;
    });
    genreInput.current.input = "";
    setGenrePredicts([]);
    genreInput.current.focus();
  };

  const handleCancelEdit = () => {
    setEdit(false);
    setImg(false);
    setImg2(false);
    setSelectedLocation(null);
    bio.current.value = userData.bio;

    setUserData((prev) => {
      return {
        ...prev,
        genre: prev.genre.filter((item) => !addedGenre.has(item.Gid)),
      };
    });
    setRemovedGenre(new Set());

    setUserData((prev) => {
      return {
        ...prev,
        instrument: prev.instrument.filter(
          (item) => !addedInstrument.has(item.Iid)
        ),
      };
    });
    setRemovedInstrument(new Set());
  };

  const handleLogout = async () => {
    await fetch("http://localhost:8000/auth/logout", {
      credentials: "include",
    });
    socket.disconnect();
    setUser(null);
  };

  const handleEdit = async () => {
    setUserData((prev) => {
      return {
        ...prev,
        genre: prev.genre.filter((item) => !removedGenre.has(item.Gid)),
      };
    });
    setUserData((prev) => {
      return {
        ...prev,
        instrument: prev.instrument.filter(
          (item) => !removedInstrument.has(item.Iid)
        ),
      };
    });
    setEdit(false);

    const formData = new FormData();
    formData.append("imgs", image.current.files[0]);
    formData.append("imgs", image2.current.files[0]);
    formData.append(
      "bio",
      bio.current.value.trim() === "" ? "" : bio.current.value
    );
    formData.append(
      "instrumentRemoved",
      JSON.stringify([...removedInstrument])
    );
    formData.append("Cid", selectedLocation?.Cid);
    formData.append("genreRemoved", JSON.stringify([...removedGenre]));
    formData.append("instrumentAdded", JSON.stringify([...addedInstrument]));
    formData.append("genreAdded", JSON.stringify([...addedGenre]));
    const data = await fetch("http://localhost:8000/editProfile", {
      method: "post",
      credentials: "include",
      body: formData,
    });
    const json = await data.json();
    setUserData(json);
  };

  const handleGetCities = async (word) => {
    if (word === "") {
      setCities([]);
      return;
    }
    const data = await fetch("http://localhost:8000/getCity/" + word, {
      credentials: "include",
    });
    const json = await data.json();
    setCities(json);
  };

  return (
    <>
      {confirm && <ConfirmationBox message={"Are your sure your want to send "+userData.name+" a friend request"} setConfirm={setConfirm} />}
      <div className={style.profile}>
        <div className={style.imgWrapper}>
          {edit && (
            <div className={style.editControls}>
              <div
                onClick={() => handleEdit()}
                className={style.editControlButtonWrapper}
              >
                <IoCheckmarkSharp className={style.editControlButton} />
              </div>
              <div
                onClick={() => handleCancelEdit()}
                className={style.editControlButtonWrapper}
              >
                <RxCross2 className={style.editControlButton} />
              </div>
            </div>
          )}
          {!edit && !location.state && (
            <button
              onFocus={() => setSettings((prev) => !prev)}
              onBlur={() => setSettings((prev) => !prev)}
              className={style.settingsWrapper}
            >
              <BsThreeDotsVertical className={style.settings} />
              {settings && (
                <div className={style.menu}>
                  <div className={style.menuItem} onClick={() => setEdit(true)}>
                    Edit profile
                  </div>
                  <div
                    className={style.menuItem}
                    onClick={() => handleLogout()}
                  >
                    Log out
                  </div>
                </div>
              )}
            </button>
          )}
          <input
            disabled={!edit}
            ref={image2}
            onChange={onImageChange2}
            className={style.input}
            type="file"
            id="img2"
            accept="image/*"
          />
          <label htmlFor="img2">
            <img
              src={
                img2
                  ? img2
                  : userData.img2
                  ? "http://localhost:8000/file/" + userData.img2
                  : Defimg2
              }
              alt=""
              className={style.img2}
            />
          </label>
          <input
            disabled={!edit}
            ref={image}
            onChange={onImageChange}
            className={style.input}
            type="file"
            id="img"
            accept="image/*"
          />
          <label htmlFor="img">
            <img
              src={
                img
                  ? img
                  : userData.img
                  ? "http://localhost:8000/file/" + userData.img
                  : Defimg
              }
              className={style.img}
              alt=""
            />
          </label>
        </div>

        <div className={style.name}>
          <div className={style.horizontalAlign}>
            {userData.name}
            {location.state && (
              <IoMdPersonAdd
                onClick={() => setConfirm(true)}
                className={style.addFriend}
              />
            )}
          </div>
          <div className={style.location}>
            <button
              disabled={!edit}
              onFocus={() => setLocationFocus(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setLocationFocus(false);
                  setCities([]);
                }
              }}
              tabIndex={-1}
              ref={locationInput}
              className={style.subLocation}
            >
              {selectedLocation
                ? selectedLocation.stateName + " / " + selectedLocation.cityName
                : userData?.location
                ? userData?.location?.stateName +
                  " / " +
                  userData?.location?.cityName
                : edit
                ? "Enter Location"
                : ""}
              {locationFocus && (
                <div className={style.cities}>
                  <input
                    autoFocus
                    type="text"
                    onKeyUp={(e) => handleGetCities(e.target.value)}
                    placeholder="City Name"
                  />
                  <div className={style.cityWrapper}>
                    {cities.map((item) => {
                      return (
                        <div
                          key={item.Cid}
                          tabIndex={0}
                          onClick={() => {
                            setSelectedLocation(item);
                            setLocationFocus(false);
                            setCities([]);
                            locationInput.current.blur();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedLocation(item);
                              setLocationFocus(false);
                              setCities([]);
                              locationInput.current.blur();
                            }
                          }}
                          className={style.city}
                        >
                          {item?.stateName + " / " + item?.cityName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
        {(userData?.instrument.length !== 0 || edit) && (
          <div className={style.tags}>
            {edit && <div className={style.subTitle}>Instruments: </div>}
            {userData.instrument.map((item) => {
              return (
                <div key={item.instrumentName} className={style.tag}>
                  {item.instrumentName}
                  {edit && (
                    <RxCross2
                      onClick={() => toggleInstrument(item.Iid)}
                      className={`${style.cross} ${
                        removedInstrument.has(item.Iid) ? style.rotate : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
            {edit ? (
              !addInstrument ? (
                <LuPlus
                  className={style.plus}
                  onClick={() => {
                    setAddInstrument(true);
                    setAddGenre(false);
                  }}
                />
              ) : (
                <div className={style.tagInputWrapper}>
                  <input
                    ref={instrumentInput}
                    onKeyUp={(e) => {
                      getInstrumentPredicts(e.target.value);
                    }}
                    className={style.tagInput}
                    autoFocus
                    type="text"
                  />
                  {instrumentPredicts.length !== 0 && (
                    <div className={style.tagInputPredicts}>
                      {instrumentPredicts.map((item, index) => {
                        if (existingInstrument.current.has(item.Iid)) {
                          return null;
                        } else {
                          return (
                            <div
                              tabIndex={0}
                              key={index}
                              onClick={() => {
                                handleAddInstrument(item);
                              }}
                              className={style.tagInputPredict}
                            >
                              {item.instrumentName}
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              )
            ) : (
              ""
            )}
          </div>
        )}
        {(userData.genre.length !== 0 || edit) && (
          <div className={style.tags}>
            {edit && <div className={style.subTitle}>Genres: </div>}
            {userData.genre.map((item) => {
              return (
                <div key={item.genreName} className={style.tag}>
                  {item.genreName}
                  {edit && (
                    <RxCross2
                      onClick={() => toggleGenre(item.Gid)}
                      className={`${style.cross} ${
                        removedGenre.has(item.Gid) ? style.rotate : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
            {edit ? (
              !addGenre ? (
                <LuPlus
                  className={style.plus}
                  onClick={() => {
                    setAddGenre(true);
                    setAddInstrument(false);
                  }}
                />
              ) : (
                <div className={style.tagInputWrapper}>
                  <input
                    ref={genreInput}
                    onKeyUp={(e) => {
                      getGenrePredicts(e.target.value);
                    }}
                    className={style.tagInput}
                    autoFocus
                    type="text"
                  />
                  {genrePredicts.length != 0 && (
                    <div className={style.tagInputPredicts}>
                      {genrePredicts.map((item, index) => {
                        if (existingGenre.current.has(item.Gid)) {
                          return null;
                        } else {
                          return (
                            <div
                              tabIndex={0}
                              key={index}
                              onClick={() => handleAddGenre(item)}
                              className={style.tagInputPredict}
                            >
                              {item.genreName}
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              )
            ) : (
              ""
            )}
          </div>
        )}
        {(userData?.bio || edit) && (
          <textarea
            disabled={!edit}
            ref={bio}
            className={`${style.info} ${edit ? style.editBio : ""}`}
            defaultValue={userData.bio}
            placeholder={edit ? "Describe Yourself" : ""}
          />
        )}
        {!location.state && (
          <Link to="/profile/newPost">
            <div className={style.add}>
              <ImCross className={style.addIcon} /> New Post
            </div>
          </Link>
        )}
        <div className={style.posts}>
          {posts.map((item) => {
            return (
              <Link key={item.Pid} to={"/profile/post"} state={item.Pid}>
                <div className={style.post}>
                  {item.mediaType.startsWith("image/") ? (
                    <img
                      src={"http://localhost:8000/file/" + item.media}
                      alt=""
                      className={style.postMedia}
                    />
                  ) : (
                    <video
                      src={"http://localhost:8000/file/" + item.media}
                      className={style.postMedia}
                    ></video>
                  )}

                  <div className={style.postTitle}>{item.title}</div>
                </div>
              </Link>
            );
          })}
        </div>
        {posts.length === 0 && (
          <div className={style.system}>No posts yet...</div>
        )}
      </div>
    </>
  );
};
export default Profile;
