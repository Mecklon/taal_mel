import style from "./Trending.module.css";
import Post from "./Post";

import { useState } from "react";
import SearchBar from "./SearchBar";


const Trending = () => {
  
  const [posts,setPosts] = useState([])
  
  return (
    <>
    <SearchBar setPosts={setPosts}/>
      <div className={style.trendingWrapper}>
        <div className={style.Trending}>
          <div className={style.scroll}>
            <div className={style.posts}>
              {posts.length===0 && <div className={style.system}>Sorry couldn't find anything, try a different filter</div>}
              {
                posts.map(item=>{
                  return <Post key={item.data.Pid} data={item} setData={setPosts}></Post>
                })
              }
            </div>
          </div>
          <div className={style.ads}></div>
        </div>
      </div>
    </>
  );
};
export default Trending;
