import "../App.css";
import style from "./Site.module.css";
import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
const Site = () => {
  const location = useLocation()

  return (
    <>
      <div className={style.wrapper}>
        <div className={style.navBar}>
          <div className={style.navBarDiv}>
            <div className={style.logo}></div>
            <div className={style.title}>Taal Mel</div>
          </div>
          <div className={style.navBarDiv}>
            <Link to="/profile" className={`${style.link} ${location.pathname.startsWith("/profile")?style.active:""}`}>
              Profile
            </Link>
            <Link to="/" className={`${style.link} ${location.pathname === "/"?style.active:""}`}>
              Network
            </Link>
            <Link to="/trending" className={`${style.link} ${location.pathname === "/trending"?style.active:""}`}>Trending</Link>
            <Link className={style.link}>Opportunities</Link>
            <Link to="/notifications" className={style.link}>Notifications</Link>
          </div>
        </div>
        <div className={style.line}></div>
        <Outlet />
      </div>
    </>
  );
};

export default Site;
