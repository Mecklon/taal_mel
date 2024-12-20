import style from "./Messages.module.css";
const SysMess = ({data,formatTimestamp}) => {
  return (
    <div className={style.sysMessWrapper}>
      <div className={style.sysMess}>
        {data.content}
        <div className={style.messTime}>{formatTimestamp(data.time_stamp)}</div>
      </div>
    </div>
  );
};
export default SysMess;
