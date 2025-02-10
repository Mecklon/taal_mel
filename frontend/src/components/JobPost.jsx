import style from "./Opportunities.module.css";
import Defimg from "../assets/defaultAvatar.png";
import { useLocation, useSearchParams } from "react-router-dom";
import { useState } from "react";
const JobPost = ({ data, setPosts }) => {
  const location = useLocation();
  const [ext, setExt] = useState(true);
  function timeAgo(timestamp) {
    const inputDate = new Date(timestamp.replace(" ", "T"));
    const now = new Date();
    const diffInSeconds = Math.floor((now - inputDate) / 1000);

    const units = [
      { name: "year", seconds: 31536000 },
      { name: "month", seconds: 2592000 },
      { name: "day", seconds: 86400 },
      { name: "hour", seconds: 3600 },
      { name: "minute", seconds: 60 },
      { name: "second", seconds: 1 },
    ];

    for (const unit of units) {
      const count = Math.floor(diffInSeconds / unit.seconds);
      if (count > 0) {
        return `${count} ${unit.name}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }
  const handleApply = async () => {
    const result = await fetch("http://localhost:8000/apply/" + data.data.Jid, {
      credentials: "include",
    });
    setPosts((prev) =>
      prev.map((item) =>
        item.data.Jid === data.data.Jid ? { ...item, applied: true } : item
      )
    );
  };

  const handleCancelApplication = async () => {
    const result = await fetch(
      "http://localhost:8000/cancelApplication/" + data.data.Jid,
      {
        credentials: "include",
      }
    );
    setPosts((prev) =>
      prev.map((item) =>
        item.data.Jid === data.data.Jid ? { ...item, applied: false } : item
      )
    );
  };

  return (
    <div className={style.post}>
      <div className={style.topWrapper}>
        <div className={style.prof}>
          <img
            src={
              data.data.img
                ? "http://localhost:8000/file/" + data.data.img
                : Defimg
            }
            className={style.profImg}
            alt=""
          />
          <div className={style.name}>{data.data.name}</div>
        </div>
        <div className={style.topWrapperSubdiv}>

          <div>{data.data.views + " view"+ ((data.data.views>1)?"s":"")}</div>
          {data.data.remote === 1 && <div className={style.remote}>Remote</div>}

          <div>{timeAgo(data.data.postDate)}</div>
        </div>
      </div>
      <div className={style.title}>{data.data.title}</div>
      <div className={style.postTags}>
        {data.genre.map((item) => {
          return (
            <div key={item.Gid} className={style.postTag}>
              {item.genreName}
            </div>
          );
        })}
        {data.instrument.map((item) => {
          return (
            <div key={item.Iid} className={style.posttag}>
              {item.instrumentName}
            </div>
          );
        })}
      </div>
      <div className={style.subBox}>
        <div className={style.head}>Job Type:</div>
        <div>{data.data.type}</div>
      </div>
      <div className={style.subBox}>
        <div className={style.head}>Payment:</div>
        <div>{data.data.payment_Details}</div>
      </div>
      <div className={style.subBox}>
        <div className={style.head}>Location:</div>
        <div>{data.data.stateName + " / " + data.data.cityName}</div>
      </div>

      <div className={style.subTitle}>Job Description: </div>
      <pre className={style.par}>{data.data.description}</pre>
      <div className={style.subTitle}>Responsibilities:</div>
      <pre className={style.par}>{data.data.responsibilities}</pre>
      <div className={style.subTitle}>Requirements:</div>
      <pre className={style.par}>{data.data.requirements}</pre>
      {location.pathname !== "/opportunities/yourPosts" && (
        <div className={style.submitWrapper}>
          {data.applied ? (
            <div onClick={handleCancelApplication} className={style.submit}>
              Cancel application
            </div>
          ) : (
            <div onClick={handleApply} className={style.submit}>
              Apply
            </div>
          )}
        </div>
      )}
      {location.pathname === "/opportunities/yourPosts" && (data.applicants.length>0) &&(
        <div className={style.applicants}>
          {ext ? (
            <div
              onClick={() => setExt(false)}
              className={style.applicantHeader}
            >
              {data.applicants.length + " applicant"}
              {data.applicants.length > 1 ? "s" : ""}
            </div>
          ) : (
            <div>
              <>
              {data.applicants.map((item, index) => {
                return (
                  <div key={index} className={style.applicantWrapper}>
                    <img
                      src={
                        item.img
                          ? "http://localhost:8000/file/" + item.img
                          : Defimg
                        }
                        className={style.applicantImg}
                        alt=""
                        />
                    <div className={style.applicantName}>{item.name}{" - "} {item.email}</div>
                  </div>
                );
              })}
              <div onClick={() => setExt(true)} className={style.upWrapper}>
                up
              </div>
              </>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default JobPost;
