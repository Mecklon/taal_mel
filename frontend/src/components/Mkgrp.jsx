import { useChatContext } from "../hooks/useChatContext";
import { useAuthContext } from "../hooks/useAuthContext";
import style from "./Mkgrp.module.css";
import { useRef, useState } from "react";
import MkgrpPerson from "./MkgrpPerson";
import socket from "./Socket";
import GrpAvatar from '../assets/avatarGroup.jpg'

const Mkgrp = ({setFilter}) => {
  const { contacts,setContacts } = useChatContext();
  const title = useRef();
  const desc = useRef();
  const [img, setImg] = useState(null);
  const [img2, setImg2] = useState(null);
  const image = useRef()
  const image2 = useRef()
  const {user} = useAuthContext()
  const [error,setError] = useState(null);
  const list = useRef();
  list.current = [{email:user.email,admin:true}]
  const select = (item) => {
    list.current = [...list.current, item];
  
    
  };
  const diselect = (email) => {
    list.current = list.current.filter((item) => item.email !== email);

  };
  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImg(URL.createObjectURL(e.target.files[0]));
    }
  };
  const onImageChange2 = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImg2(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleMkGrp = async () => {
    setError(false)
    if(title.current.value === ""){
      setError("Enter a title for the group")
      return;
    }
    const formData = new FormData()
    formData.append("title",title.current.value)
    formData.append("caption",desc.current.value)
    formData.append("imgs",image.current.files[0])
    formData.append("imgs",image2.current.files[0])
    formData.append("members",JSON.stringify(list.current))
    const data = await  fetch("http://localhost:8000/mkGrp",{
      method:"post",
      credentials:"include",
      body:formData
    })  
    const json = await data.json()  
    setContacts(prev=>[...prev,json])
    setFilter(2)
    socket.emit("newGrp",json)
  };
  return (
    <div className={style.mkGrpWrapper}>
      <div className={style.mkGrp}>
        <label htmlFor="secImage">
          <img className={style.secImg} src={img2 ? img2 : GrpAvatar} alt="" />
        </label>
        <input
        ref={image2}
        onChange={onImageChange2}
        className={style.input}
        type="file"
        id="secImage"
        accept="image/*"
        />
        <label htmlFor="img">
          <img className={style.img} src={img ? img : GrpAvatar} alt="" />
        </label>
        <input
          ref={image}
          onChange={onImageChange}
          className={style.input}
          id="img"
          type="file"
          accept="image/*"
        />
        <input
          type="text"
          ref={title}
          placeholder="Title"
          className={style.title}
        />
        <textarea
          type="text"
          ref={desc}
          placeholder="Description"
          rows={5}
          className={style.desc}
        />
        <div className={style.subTitle}>Add members:</div>
        <div className={style.members}>
          {contacts.map((item) =>
            !item.isGroup ? (
              <MkgrpPerson
                key={item.Rid}
                item={item}
                select={select}
                diselect={diselect}
              />
            ) : (
              ""
            )
          )}
        </div>
        <div className={style.createWrapper}>
        <div className={style.error}>{error?error:""}</div>
          <div onClick={handleMkGrp} className={style.create}>Create Group</div>
        </div>
      </div>
    </div>
  );
};
export default Mkgrp;
