import { createContext, useEffect, useState } from "react";
import socket from "../components/Socket";
export const AuthContext = createContext()

const AuthContextProvider = ({children})=>{

    const [user,setUser] = useState(null)

    useEffect(()=>{
        const autoLogin = async()=>{
            const data = await fetch("http://localhost:8000/auth/autoLogin",{credentials:"include"})
            if(data.ok){
                const json = await data.json()
                setUser(json)
            }
        }
        autoLogin()
    },[setUser])

    useEffect(() => {
        if(!user)return;
        socket.connect()
        socket.emit("setup", { email:user.email });
      }, [user,socket]);
      
    return <AuthContext.Provider value={{user,setUser}}>{children}</AuthContext.Provider>
}

export default AuthContextProvider