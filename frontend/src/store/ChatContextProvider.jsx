import { createContext, useEffect, useState } from "react";
import socket from "../components/Socket";
export const ChatContext = createContext()

const ChatContextProvider = ({children})=>{

    const [contacts,setContacts] = useState([])
    const [currRoom,setCurrRoom] = useState({})
    useEffect(()=>{
        const getContacts = async()=>{
            const data = await fetch("http://localhost:8000/getContacts",{
                credentials:"include"
            })
            const json = await data.json()
            setContacts([...json.friends,...json.groups])
        }
        getContacts()
    },[setContacts])

    useEffect(()=>{
        setContacts(prev=>
            prev.map(item=>
                item.Rid === currRoom.Rid ? {...item,pending:0}:item
            )
        )
    },[currRoom,setContacts])
    
    useEffect(()=>{
        socket.on("newOnline",(email)=>{
            if(!contacts)return 
            setContacts(prev=>
                prev.map(item=>
                    !item.isGroup && item.email === email ? {
                        ...item,
                        _online:true
                    }:item
                )
            )
            if(currRoom?.email === email){
                setCurrRoom(prev=>{
                  return {...prev, _online: true}
                })
              }
        })
        
        socket.on("newOffline",(data)=>{
            if(!contacts) return 
            setContacts(prev=>
                prev.map(item=>
                    !item.isGroup && item.email === data.email ? {
                        ...item,
                        _online:false,
                        
                    }:item
                )
            )
            if(currRoom?.email === data.email){
                setCurrRoom(prev=>{
                  return {...prev, _online: false,last_seen:data.last_seen}
                })
              }
        })
        socket.on("newGrp",(data)=>{
            console.log(data)
            setContacts(prev=>[...prev,data])
            socket.emit("joinGrp",data.Rid)
        })
        socket.on("newGrpAdded",data=>{
            setContacts(prev=> [data,...prev])
            socket.emit("joinGrp",data.Rid)
          })
        socket.on("removed",Rid=>{
            setContacts(prev=>
              prev.filter(contact=>
                contact.Rid !== Rid
              )
            )
            if(Rid===currRoom.Rid){
              setCurrRoom({})
            }
          })
        return ()=>{
            socket.off("newOnline")
            socket.off("newOffline")
            socket.off("newGrp")
            socket.off("removed")
            socket.off("newGrpAdded")
        }
    },[socket,setContacts,setCurrRoom,currRoom])
         
    return <ChatContext.Provider value={{contacts,setContacts,currRoom,setCurrRoom}}>{children}</ChatContext.Provider>
}

export default ChatContextProvider