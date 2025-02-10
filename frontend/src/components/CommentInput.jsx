import { useRef, useState } from "react";
import style from "./Trending.module.css";
const CommentInput = ({ setData,setComments, PPid }) => {
  const [ext, setExt] = useState(false);
  const input = useRef();
  if (!ext) {
    return (
      <form
        className={`${style.commentInputWrapper} ${style.padding}`}
        onClick={() => setExt(true)}
      >
        Add a comment
      </form>
    );
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(input.current.value ==="")return 
    const data = await fetch("http://localhost:8000/postComment", {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "Post",
      body: JSON.stringify({
        content: input.current.value,
        PPid,
      }),
    });
    const json = await data.json()
    setComments(prev=>{
      return [json,...prev]
    })
    setData((prev) =>
      prev.map((item) =>
        item.data.PPid === PPid
          ? {
              ...item,
              data: {
                ...item.data,
                comments: item.data.comments + 1,
              },
            }
          : item
      )
    );
    setExt(false)
  };
  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className={style.commentInputWrapper}
    >
      <textarea
        ref={input}
        autoFocus
        rows="3"
        type="text"
        className={style.commentInput}
      />
      <div className={style.commentButtons}>
        <div
          onClick={() => setExt(false)}
          className={`${style.commentButton} ${style.cancel}`}
        >
          Cancel
        </div>
        <button  className={`${style.commentButton} ${style.send}`}>Comment</button>
      </div>
    </form>
  );
};
export default CommentInput;
