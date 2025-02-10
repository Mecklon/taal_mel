import { useLocation } from "react-router-dom";
import Post from "./Post";
import style from "./Profile.module.css"
import { useEffect, useState } from "react";
const ProfilePost = () => {
  const location = useLocation()
  
  const [data,setData] = useState([])
  useEffect(()=>{
    const getData = async()=>{
      const data = await fetch("http://localhost:8000/getPost/"+location.state,{credentials:"include"})
      const json = await data.json()
      setData(json)
    }
    getData()
  },[])

  return (
    <div className={style.postWrapper}>
      <Post data={data[0]} setData={setData}/>
    </div>
  );
};
export default ProfilePost;
