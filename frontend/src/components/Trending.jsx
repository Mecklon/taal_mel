import style from "./Trending.module.css";
import Post from "./Post";
const Trending = () => {
  return (
    <>
    <div className={style.search}>
      <input type="text" className={style.searchInput} />
    </div>
    <div className={style.trendingWrapper}>

      <div className={style.Trending}>
        <div className={style.scroll}>
          <div className={style.posts}>
            <Post />
            <Post />
            <Post />
            <Post />
          </div>
        </div>
        <div className={style.ads}></div>
      </div>
    </div>
    </>
  );
};
export default Trending;
