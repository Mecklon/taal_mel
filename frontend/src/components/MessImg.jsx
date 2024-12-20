import { useState } from "react";
import style from "./Messages.module.css";

const MessImg = ({ attachment }) => {
  const [extended, setExtended] = useState();
  const handleExtend = ()=>{setExtended(prev=>!prev)}
  return (
    <div onClick={handleExtend} className={`${extended && style.lightBox}`}>
      <img
        src={"http://localhost:8000/file/" + attachment}
        className={`${!extended ?style.img:style.extImg}`}
        alt=""
      />
    </div>
  );
};
export default MessImg;
