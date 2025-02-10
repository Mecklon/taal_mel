import { useOutletContext } from "react-router-dom";
import JobPost from "./JobPost";
import { useEffect } from "react";
const Applications = () => {
  const { posts, setPosts } = useOutletContext();
    useEffect(()=>{
        const getPosts = async ()=>{
            const data = await fetch("http://localhost:8000/getApplications",{credentials:"include"})
            const json = await data.json()
            setPosts(json)
        }
        getPosts() 
    },[])
  return (
    <>
      {posts.map((item) => (
        <JobPost key={item.data.Jid} data={item} setPosts={setPosts} />
      ))}
    </>
  );
};
export default Applications;
