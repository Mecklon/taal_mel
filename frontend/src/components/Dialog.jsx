import style from "./Dialog.module.css";
import { FaPaperclip } from "react-icons/fa";
import { FaPaperPlane } from "react-icons/fa";
import Messages from "./Messages";
import { useChatContext } from "../hooks/useChatContext";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import GrpInfo from "./GrpInfo";
import socket from "./Socket.jsx"
const Dialog = () => {
  const {currRoom,setContacts} = useChatContext()
  const [chats,setChats] = useState([])
  const [fetching,setFetching] = useState()
  const [grpInfo,setGrpInfo] = useState(false)
  const input = useRef()
  const file = useRef()
  const [typing,setTyping] = useState()
 

  useEffect(()=>{
    setGrpInfo(false)
  },[currRoom,setGrpInfo])

  const formatTimestamp = (inputTimestamp)=>{
    const now = new Date();
    const inputDate = new Date(inputTimestamp);
    const isSameDay =
        inputDate.getFullYear() === now.getFullYear() &&
        inputDate.getMonth() === now.getMonth() &&
        inputDate.getDate() === now.getDate();
    if (isSameDay) {
        const hours = inputDate.getHours().toString().padStart(2, "0");
        const minutes = inputDate.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }
    return `${inputDate.getFullYear()}/${inputDate.getMonth() + 1}/${inputDate.getDate()}`;
}

  useEffect(()=>{
    const getChats = async()=>{
      if(!currRoom)return
      setFetching(true)
      const data = await fetch("http://localhost:8000/getChats",{
        method:"post",
        headers:{
          "Content-Type":"application/json"
        },
        credentials:"include",
        body:JSON.stringify({
          Rid:currRoom.Rid
        })
      })
      setFetching(false)
      const json = await data.json()
      setChats(json)
    }
    getChats()
  },[currRoom.Rid,setChats,setFetching])

  const handleSendMessage = async(e)=>{
    e.preventDefault()
    if(!file.current.files[0] && (!input.current.value || input.current.value.trim()===""))return
  
    const formData = new FormData()
    formData.append("content",input.current.value.trim())
    formData.append("receiver",currRoom.email)
    formData.append("Rid",currRoom.Rid)
    formData.append("file",file.current.files[0])

    const data = await fetch("http://localhost:8000/sendMessage",{
      method: "POST",
      credentials: "include",
      body: formData,
    })
    input.current.value = ""
    const json = await data.json()
    setChats(prev=>[...prev,json])
    setContacts(prev=>{
      return prev.map(item=>{
        return item.Rid === currRoom.Rid?{
          ...item,sender:json.sender,content:json.content,time_stamp:json.time_stamp
        }:item
      })
    })
    socket.emit("emitMessage",{message:json,receiver:currRoom.email,Rid:currRoom.Rid})
  }

  useEffect(()=>{
    socket.on("emitMessage",(data)=>{
      setContacts(prev=>
        prev.map(item=>
          item.Rid === data.Rid ? {...item,sender:data.message.sender,content:data.message.content,time_stamp:data.message.time_stamp,attachment:data.attachment,mimetype:data.mimetype} : item
        )
      )
      
      if(currRoom!==null && currRoom.Rid === data.Rid){
        setChats(prev=>[...prev,data.message])
        setTyping(false)
        return
      } 

      setContacts(prev=>
        prev.map(item=>
          item.Rid === data.Rid ? {...item,pending:item.pending+1} : item
        )
      )
      socket.emit("incPending",data.Rid) 
    })
    return ()=>{
      socket.off("emitMessage")
    }
  },[currRoom,socket,setChats,setContacts])

  const handleTyping = ()=>{
    const to = currRoom.isGroup? currRoom.Rid:currRoom.email;
    socket.emit("typing",{to,isGroup:currRoom.isGroup,Rid:currRoom.Rid})
  }

  if(!currRoom.Rid){
    return <div className={style.roomNotSelected}>No chat selected</div>
  }
  if(fetching){
    return <div className={style.roomNotSelected}>fetching</div>
  }
  if(grpInfo){
    return <GrpInfo setGrpInfo={setGrpInfo}/>
  }
  return (
    <div className={style.dialog}>
      <div className={style.title}>
        {currRoom.isGroup?currRoom.title:currRoom.name}
        {currRoom.isGroup ? <div className={style.grpSettingBtn}
        onClick={()=>{setGrpInfo(true)}}
        ><BsThreeDotsVertical className={style.grpSettingBtnIcon}/></div>:""}
        </div>
      <div className={style.details}>{currRoom.isGroup? '':currRoom._online ?"Online":"last seen "+formatTimestamp(currRoom.last_seen)}</div>
        <Messages setTyping={setTyping} typing={typing} chats={chats} setChats={setChats}></Messages>
      <form onSubmit={handleSendMessage} className={style.inputWrapper}>
        <label htmlFor="file" className={style.inputIconWrapper}>
          <FaPaperclip className={style.inputIcon} />
        </label>
        <input id="file" type="file" className={style.fileInput} ref={file} />
        <input onChange={handleTyping} ref={input} type="text" className={style.messInput} />
        <button className={style.inputIconWrapper}>
          <FaPaperPlane className={style.inputIcon} />
        </button>
      </form>
    </div>
  );
};
export default Dialog;
