import { useOutletContext } from "react-router-dom";
import JobPost from "./JobPost";
import style from "./Opportunities.module.css";
import { useCallback, useEffect, useRef } from "react";

const JobPosts = () => {
  const { posts, setPosts } = useOutletContext();
  const observer = useRef(null);

  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const itemData = JSON.parse(entry.target.dataset.item);
          fetch("http://localhost:8000/upViews/" + itemData, {
            credentials: "include",
          });
          observer.current.unobserve(entry.target);
        }
      });
    });

    return () => observer.current.disconnect();
  }, []);

  console.log(posts);
  const callBackRef = useCallback((node, item) => {
    if (!node) return;
    node.dataset.item = JSON.stringify(item.data.Pid);
    if (observer.current) {
      observer.current.observe(node);
    }
  }, []);

  return (
    <>
      {posts.map((item) => (
        <div ref={(node) => callBackRef(node, item)} key={item.data.Jid}>
          <JobPost data={item} setPosts={setPosts} />
        </div>
      ))}
      {posts.length === 0 && (
        <div className={style.system}>
          Sorry, could not find anything, try a different filter.
        </div>
      )}
    </>
  );
};

export default JobPosts;
