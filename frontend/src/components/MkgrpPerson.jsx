import { useState } from "react";
import { GoPlus } from "react-icons/go";
import style from "./Mkgrp.module.css";
import avatar from '../assets/defaultAvatar.png'
const MkgrpPerson = ({item,select,diselect}) => {
    const [selected,setSelected] = useState(false)
    const [admin,setAdmin] = useState(false)

    const handleToggle = ()=>{  
        if(selected){
            diselect(item.email)
        }else{
            select({email:item.email,admin})
        }
        setSelected(prev=>!prev)
        
    }
    const handleToggleAdmin = ()=>{
        setAdmin(item=>!item)
    }
  return (
    <div className={style.member}>
      <img src={item.img?item.img:avatar} className={style.memberImg} alt="" />
      <div className={style.memberSub}>
        <div>{item.name}</div>
        <div>{item.email}</div>
      </div>
      <button disabled={selected} onClick={handleToggleAdmin} className={admin? style.adminActive:style.admin}>Admin</button>
      <div onClick={handleToggle} className={style.button} >
        <GoPlus className={`${style.buttonIcon} ${selected && style.rotate}`} />
      </div>
    </div>
  );
};
export default MkgrpPerson;
