import { BiUpvote } from "react-icons/bi";
import { BiDownvote } from "react-icons/bi";
import { FaRegComment } from "react-icons/fa";
import style from "./Trending.module.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import defImg from "../assets/defaultAvatar.png";
import { useEffect, useRef, useState } from "react";
import Comment from "./Comment";
import { useLocation } from "react-router-dom";
import CommentInput from "./CommentInput";
import { Link } from "react-router-dom";
const Post = ({ data, setData }) => {
  const location = useLocation();
  const [ext, setExt] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(0);
  const [settings, setSettings] = useState(false);
  const settingsRef = useRef()
 
  useEffect(() => {
    if (!location.pathname.startsWith("/profile")) return;
    setExt(true);
  }, []);

  useEffect(() => {
    const getComments = async () => {

      if (ext === false || comments.length !== 0 || data === null) return;
      const result = await fetch(
        "http://localhost:8000/getComments/" +
          data.data.PPid +
          "/" +
          commentPage,
        { credentials: "include" }
      );

      const json = await result.json();
      setComments((prev) => {
        return [...prev, ...json];
      });
    };
    getComments();
  }, [ext, data, commentPage]);

  const handleUpvote = async () => {
    let code = null;

    setData((prev) =>
      prev.map((item) =>
        item.data.PPid === data.data.PPid
          ? {
              ...item,
              like: item.like === 1 ? null : 1,
              data: {
                ...item.data,
                likes:
                  item.like === 1
                    ? item.data.likes - 1
                    : item.like === 0
                    ? item.data.likes + 1
                    : item.data.likes + 1,
                dislikes:
                  item.like === 0 ? item.data.dislikes - 1 : item.data.dislikes,
              },
            }
          : item
      )
    );

    if (data?.like === 1) code = 1;
    else if (data?.like === 0) code = 2;
    else code = 3;

    await fetch("http://localhost:8000/upVote", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, PPid: data.data.PPid }),
    });
  };

  const handleDownvote = async () => {
    let code = null;

    setData((prev) =>
      prev.map((item) =>
        item.data.PPid === data.data.PPid
          ? {
              ...item,
              like: item.like === 0 ? null : item.like === 1 ? 0 : 0,
              data: {
                ...item.data,
                dislikes:
                  item.like === 0
                    ? item.data.dislikes - 1
                    : item.like === 1
                    ? item.data.dislikes + 1
                    : item.data.dislikes + 1,
                likes:
                  item.like === 1
                    ? item.data.likes - 1
                    : item.like === 0
                    ? item.data.likes - 1
                    : item.data.likes,
              },
            }
          : item
      )
    );

    if (data?.like === 0) code = 1;
    else if (data?.like === 1) code = 2;
    else code = 3;

    await fetch("http://localhost:8000/downVote", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, PPid: data.data.PPid }),
    });
  };
  function timeAgo(timestamp) {
    const inputDate = new Date(timestamp.replace(" ", "T"));
    const now = new Date();
    const diffInSeconds = Math.floor((now - inputDate) / 1000);
    const units = [
      { name: "year", seconds: 31536000 },
      { name: "month", seconds: 2592000 },
      { name: "day", seconds: 86400 },
      { name: "hour", seconds: 3600 },
      { name: "minute", seconds: 60 },
      { name: "second", seconds: 1 },
    ];

    for (const unit of units) {
      const count = Math.floor(diffInSeconds / unit.seconds);
      if (count > 0) {
        return `${count} ${unit.name}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }
  return (
    <div className={style.post}>
      {!location.pathname.startsWith("/profile") && (
        <div className={style.postHeader}>
          <img
            src={
              data.user.img
                ? "http://localhost:8000/file/" + data.user.img
                : defImg
            }
            alt=""
            className={style.profile}
          />
          <div className={style.name}>{data.user.name}</div>
          <div className={style.time}>| {timeAgo(data.data.postDate)}</div>
          <div className={style.settingsWrapper}>
            <button
              ref={settingsRef}
              onFocus={() => setSettings(true)}
              onBlur={(e)=>{
                if (!settingsRef.current.contains(e.relatedTarget)) {
                  setSettings(false)
                }
              }}
              className={style.settings}
            >
              <BsThreeDotsVertical className={style.settingsIcon} />
              {
                settings && <div className={style.settingsOptions}>
                <Link to={'/profile'} state={data.data.email} className={style.settingsOption}>Visit Profile</Link>
                <div className={style.settingsOption}>Report</div>
              </div>
              }
            </button>
          </div>
        </div>
      )}
      {data?.data.mediaType.startsWith("image/") ? (
        <img
          src={"http://localhost:8000/file/" + data?.data.media}
          className={style.media}
          alt=""
        />
      ) : data?.data.mediaType.startsWith("video/") ? (
        <video
          src={"http://localhost:8000/file/" + data?.data.media}
          className={style.media}
          controls
        ></video>
      ) : null}
      <div className={style.postButtons}>
        <div className={style.postButtonWrapper}>
          <div className={style.postButton} onClick={() => handleUpvote()}>
            <BiUpvote
              className={`${style.postButtonIcon} ${
                data?.like === 1 ? style.upVoted : ""
              }`}
            />
          </div>
          {data?.data.likes}
          <div className={style.postButton} onClick={() => handleDownvote()}>
            <BiDownvote
              className={`${style.postButtonIcon} ${
                data?.like === 0 ? style.downVoted : ""
              }`}
            />
          </div>
          {data?.data.dislikes}
        </div>
        <div className={style.postButtonWrapper}>
          <div
            className={style.postButton}
            onClick={() => setExt((prev) => !prev)}
          >
            <FaRegComment className={style.postButtonIcon} />
          </div>
          {data?.data.comments}
        </div>
        <div className={style.views}>{data?.data.views + " views"}</div>
      </div>
      <div className={style.postTitle}>{data?.data.title}</div>
      <div className={style.postDesc}>{data?.data.content}</div>
      {ext && (
        <div className={style.comments}>
          <CommentInput
            setData={setData}
            setComments={setComments}
            PPid={data?.data.PPid}
          ></CommentInput>
          {comments.map((item, index) => {
            if (index === comments.length - 1) {
              return (
                <>
                  <Comment key={item.Coid} data={item} />
                  <div
                    onClick={() => setCommentPage((prev) => prev + 1)}
                    className={style.more}
                  >
                    more
                  </div>
                </>
              );
            } else {
              return <Comment key={item.Coid} data={item} />;
            }
          })}
        </div>
      )}
    </div>
  );
};
export default Post;
