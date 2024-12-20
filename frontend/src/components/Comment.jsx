import style from "./Trending.module.css";
import img from "../assets/wallhaven-j3w6om.jpg";
const Comment = ()=>{
    return <div className={style.comment}>
        <div className={style.commentHeader}>
            <img src={img} className={style.commentProfile} alt="" />
            <div className={style.commentName}>Mecklon Fernandes</div> 
            <div className={style.commentTime}>| 4 hours ago</div>
        </div>
            <div className={style.commentContent}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod veniam natus eveniet qui corporis deserunt enim adipisci ab et explicabo quibusdam, recusandae ipsa cum excepturi accusantium quae fugiat nemo at?
            </div>
    </div>
}
export default Comment