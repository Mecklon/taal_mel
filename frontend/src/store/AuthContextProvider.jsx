import { createContext, useEffect, useState } from "react";
import socket from "../components/Socket";
export const AuthContext = createContext()

const AuthContextProvider = ({children})=>{

    const [user,setUser] = useState(null)
    const [profData,setProfData] = useState(null)
    useEffect(()=>{
        const autoLogin = async()=>{
            const data = await fetch("http://localhost:8000/auth/autoLogin",{credentials:"include"})
            if(data.ok){
                const json = await data.json()
                setUser(json)
            }
        }
        autoLogin()
    },[])

    useEffect(()=>{
        if(!user)return
        const getProfData = async ()=>{
            const data = await fetch("http://localhost:8000/getProfData",{
                credentials:"include",
                headers:{
                    "Content-Type":"application/json"
                },
                method:"post",
                body:JSON.stringify({
                    email:user.email
                })
            })
            const json = await data.json();
            setProfData(json)
        }
        getProfData();
    },[user])
    
    useEffect(() => {
        if(!user)return;
        socket.connect()
        socket.emit("setup", { email:user.email });
        
    }, [user,socket]);
      
    return <AuthContext.Provider value={{user,setUser,profData,setProfData}}>{children}</AuthContext.Provider>
}

export default AuthContextProvider