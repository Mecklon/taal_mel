import style from "./Chat.module.css";
const ChatNav = ({ setFilter, filter }) => {
  return (
    <div>
      <div className={style.options}>
        <div onClick={() => setFilter(1)} className={`${style.option} ${filter===1 && style.active}`}>
          <div className={style.optionText}>Friends</div>
        </div>
        <div onClick={() => setFilter(2)} className={`${style.option} ${filter===2 && style.active}`}>
          <div className={style.optionText}>All</div>
        </div>
        <div onClick={() => setFilter(3)} className={`${style.option} ${filter===3 && style.active}`}>
          <div className={style.optionText}>Groups</div>
        </div>
        <div onClick={() => setFilter(4)} className={`${style.option} ${filter===4 && style.active}`}>
          <div className={style.optionText}>Make Group</div>
        </div>
      </div>
    </div>
  );
};
export default ChatNav;
