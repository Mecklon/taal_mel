import { useState } from "react";
import style from "./Trending.module.css";
const CommentInput = () => {
    const [ext,setExt] = useState(false)
    console.log(ext)
    if(!ext){
        return <form className={`${style.commentInputWrapper} ${style.padding}`} onClick={()=>setExt(true)}>
       Add a comment
      </form>
    }
  return (
    <form className={style.commentInputWrapper}>
      <textarea autoFocus rows='3' type="text" className={style.commentInput} />
      <div className={style.commentButtons}>
        <div onClick={()=>setExt(false)} className={`${style.commentButton} ${style.cancel}`}>Cancel</div>
        <div className={`${style.commentButton} ${style.send}`}>Comment</div>
      </div>
    </form>
  );
};
export default CommentInput;
