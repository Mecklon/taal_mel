import avatar from "../assets/defaultAvatar.png";
import { useChatContext } from "../hooks/useChatContext";
import style from "./Messages.module.css";
import MessImg from "./MessImg";
const RecMess = ({ data, formatTimestamp }) => {
  const { currRoom } = useChatContext();

  return (
    <div className={style.messWrapper}>
      {currRoom.isGroup ? (
        <img className={style.profImg} src={data.img ? data.img : avatar} />
      ) : (
        ""
      )}
      <div
        className={`${style.recMess} ${data.attachment ? style.hasImage : ""}`}
      >
        {currRoom.isGroup ? (
          <div className={style.senderName}>{data.senderName}</div>
        ) : (
          ""
        )}
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
export default RecMess;
