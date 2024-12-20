import style from './Messages.module.css'
import SentMess from './SentMess';
import socket from './Socket';
import RecMess from './RecMess';
import { useAuthContext } from '../hooks/useAuthContext';
import { useRef,useEffect } from 'react';
import loading from '../assets/loading.gif'
import { useChatContext } from '../hooks/useChatContext';
import SysMess from './SysMess';
const Messages = ({chats,typing,setTyping})=>{

    const {user} = useAuthContext()
    const {currRoom} = useChatContext()
    const messages = useRef()
    const debounceTimer = useRef(null);
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
        setTimeout(() => {
        if(messages.current === null)return
        messages.current.scrollTop = messages.current.scrollHeight
        },10);
        },[chats])

        useEffect(()=>{
            if(!typing)return;
            setTimeout(()=>{
              if(messages.current.scrollTop+messages.current.offsetHeight>=messages.current.scrollHeight-400)
              messages.current.scrollTop = messages.current.scrollHeight
            },)
          },[typing])
          
          
        useEffect(() => {
            socket.on("typing", (Rid) => {
                if(Rid!==currRoom.Rid) return
              
                setTyping((prev) => (!prev ? true : prev)); 
            
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
            
                debounceTimer.current = setTimeout(() => {
                  setTyping(false); 
                  debounceTimer.current = null;
                }, 1000);
              });  
            return () => {
              socket.off("typing"); 
              if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
                debounceTimer.current = null;
              }
            };
          }, [socket, currRoom, setTyping]);
        

    return <div className={style.messages} ref={messages}>
        {chats.map(item=>{
            return !item.sender?<SysMess key={item.Mid} formatTimestamp={formatTimestamp} data={item}/>:item.sender===user.email? <SentMess key={item.Mid} data={item} formatTimestamp={formatTimestamp}/>:<RecMess key={item.Mid} data={item} formatTimestamp={formatTimestamp}/>
        })}
        {
            typing &&
            <div className={style.messWrapper}>
                <div className={style.loadingWrapper}>
                    <img src={loading} className={style.loading} alt="" />
                </div>
            </div>
        }
        
    </div>
}
export default Messages;