import { useEffect, useState } from "react";
import style from "./Opportunities.module.css";
import SearchBar from "./SearchBar";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
const Opportunities = () => {
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  
  useEffect(() => {}, [location.pathname]);
  return (
    <>
      <div className={style.opportunitiesWrapper}>
        <div className={style.oportunities}>
          <div className={style.nav}>
            <Link
              to="/opportunities"
              className={`${style.navTab} ${
                location.pathname === "/opportunities" ? style.active : ""
              }`}
            >
              Opportunities
            </Link>
            <Link
              to="/opportunities/applications"
              className={`${style.navTab} ${
                location.pathname === "/opportunities/applications"
                  ? style.active
                  : ""
              }`}
            >
              Applications
            </Link>
            <Link
              to="/opportunities/yourPosts"
              className={`${style.navTab} ${
                location.pathname === "/opportunities/yourPosts"
                  ? style.active
                  : ""
              }`}
            >
              Your posts
            </Link>
          </div>
          <div className={style.scroll}>
            {location.pathname === '/opportunities' && <SearchBar setPosts={setPosts} />}
            <div className={style.posts}> 
              <Outlet context={{posts,setPosts}}/>
            </div>
          </div>
          <div className={style.ads}></div>
        </div>
      </div>
    </>
  );
};
export default Opportunities;
