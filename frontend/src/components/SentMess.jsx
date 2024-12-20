import style from "./Messages.module.css";
import MessImg from "./MessImg";
const SentMess = ({ data, formatTimestamp }) => {
  return (
    <div className={style.messWrapperSend}>
      <div
        className={`${style.sentMess} ${data.attachment ? style.hasImage : ""}`}
      >
        {data.attachment &&
          data.mimetype &&
          data.mimetype.split("/")[0] === "image" && (
            <MessImg attachment={data.attachment}></MessImg>
          )}
        {data.attachment &&
          data.mimetype &&
          data.mimetype.split("/")[0] === "video" && (
            <video
              src={"http://localhost:8000/file/" + data.attachment}
              className={style.img}
              controls
            ></video>
          )}
        {data.attachment &&
          data.mimetype &&
          data.mimetype.split("/")[0] === "audio" && (
            <audio
              src={"http://localhost:8000/file/" + data.attachment}
              className={style.img}
              controls
            ></audio>
          )}
        <div className={style.messContent}>{data.content}</div>
        <div className={style.messTime}>{formatTimestamp(data.time_stamp)}</div>
      </div>
    </div>
  );
};
export default SentMess;
