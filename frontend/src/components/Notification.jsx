import style from "./Notifications.module.css";
import defAvatar from "../assets/defaultAvatar.png";
import defGrpAvatar from "../assets/avatarGroup.jpg";
import vageta from "../assets/vageta.jpeg";
const Notification = ({ data }) => {
  let content;
  if (data.type === 1) {
    content = <span><strong>{data.name}</strong> has sent you a friend request</span>;
  } else if (data.type === 2) {
    content = <span>You were added to group <strong>{data.name}</strong></span>;
  } else if (data.type === 3) {
    content = <span>You were kicked out of group <strong>{data.name}</strong></span>;
  } else if (data.type === 4) {
    content = <span>Your friend request was accepted by <strong>{data.name}</strong></span>;
  } else if (data.type === 5) {
    content = <span>Your friend request was rejected by <strong>{data.name}</strong></span>;
  } else if (data.type === 6) {
    content = <span><strong>{data.name}</strong> unfriended you</span>;
  } else if (data.type === 7) {
    content = <span>Your ad <strong>{data.name}</strong> was accepted</span>;
  } else if (data.type === 8) {
    content = <span>Your ad <strong>{data.name}</strong> was rejected due to being {data.issue}</span>;
  } else if (data.type === 9) {
    content = <span>Your post with the title <strong>{data.name}</strong> was rejected due to being {data.issue}</span>;
  }

  return (
    <div className={`${style.notification} ${!data.seen && style.unseen}`}>
      <div className={`${style.dot} ${data.seen && style.noDot}`}></div>
      <img
        className={style.img}
        src={
          data.img
            ? data.img
            : data.systemMess
            ? vageta
            : data.isGroup
            ? defGrpAvatar
            : defAvatar
        }
        alt=""
      />
      <div className={style.notifDiv}>
        <div className={style.content}>{content}</div>
        {data.type === 1 && (
          <div className={style.options}>
            <div className={`${style.accept} ${style.button}`}>Accept</div>
            <div className={`${style.reject} ${style.button}`}>Reject</div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Notification;
