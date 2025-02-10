import style from "./Trending.module.css";
import defImg from "../assets/wallhaven-j3w6om.jpg";
const Comment = ({ data }) => {
  const { name, content, img, time_created } = data;
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
      <div className={style.comment}>
        <div className={style.commentHeader}>
          <img
            src={img ? "http://localhost:8000/file/" + img : defImg}
            className={style.commentProfile}
            alt=""
          />
          <div className={style.commentName}>{name}</div>
          <div className={style.commentTime}>| {timeAgo(time_created)}</div>
        </div>
        <div className={style.commentContent}>{content}</div>
      </div>
    );
};
export default Comment;
