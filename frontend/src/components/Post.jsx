import { BiUpvote } from "react-icons/bi";
import { BiDownvote } from "react-icons/bi";
import { FaRegComment } from "react-icons/fa";
import style from "./Trending.module.css";
import img from "../assets/wallhaven-j3w6om.jpg";
import { useEffect, useState } from "react";
import Comment from "./Comment";
import { useLocation } from "react-router-dom";
import CommentInput from "./CommentInput";
const Post = () => {
  const location = useLocation()
  const [ext,setExt] = useState(false)
  useEffect(()=>{
    if(!location.pathname.startsWith("/profile"))return
    setExt(true)
    console.log("hello")
  },[])
  return (
    <div className={style.post}>
        {
          !location.pathname.startsWith('/profile') &&
          <div className={style.postHeader}>
            <img src={img} alt="" className={style.profile}/>
            <div className={style.name}>Mecklon Fernandes</div>
            <div className={style.time}>| 6hrs ago</div>
        </div>
        }
      <img src={img} className={style.media} alt="" />
      <div className={style.postButtons}>
        <div className={style.postButtonWrapper}>
          <div className={style.postButton}>
            <BiUpvote className={style.postButtonIcon}/>
          </div>
          417
          <div className={style.postButton}>
            <BiDownvote className={style.postButtonIcon}/>
          </div>
          2354
        </div>
        <div className={style.postButtonWrapper}>
          <div className={style.postButton} onClick={()=>setExt(prev=>!prev)}>
            <FaRegComment className={style.postButtonIcon}/>
          </div>
          2354
        </div>
      </div>
      <div className={style.postTitle}>Title</div>
      <div className={style.postDesc}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis
        minus laborum repellat recusandae blanditiis doloribus odit odio illo
        consectetur officia eveniet magni perferendis vero excepturi magnam, non
        aperiam! Officia, dolore?
      </div>
      {
        ext &&
        
        <div className={style.comments}>
          <CommentInput></CommentInput>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          <Comment/>
          </div>
      }
    </div>
  );
};
export default Post;
