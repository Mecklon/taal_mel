import { useContext } from "react";
import { ChatContext } from "../store/ChatContextProvider";

export const useChatContext = ()=>{
    const context = useContext(ChatContext)
    return context 
} 