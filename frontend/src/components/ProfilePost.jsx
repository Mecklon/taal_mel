import Post from "./Post";
import style from "./Profile.module.css"
const ProfilePost = () => {
  return (
    <div className={style.postWrapper}>
      <Post />
    </div>
  );
};
export default ProfilePost;
