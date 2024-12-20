import style from './Contact.module.css'
import avatar from '../assets/defaultAvatar.png'
import GrpAvatar from '../assets/avatarGroup.jpg'
import { useChatContext } from '../hooks/useChatContext' 
import {useAuthContext} from '../hooks/useAuthContext' 
const ContactUnit = ({data})=>{
    const {setCurrRoom,currRoom} = useChatContext()
    const {user} = useAuthContext()
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

    const handleContactSelect = () =>{
        if(currRoom && currRoom.Rid===data.Rid)return 
        setCurrRoom(data)
    }
    return <div onClick={handleContactSelect} className={`${style.contact} ${currRoom.Rid === data.Rid && style.active}`}>
        <img src={data.img?"http://localhost:8000/file/"+data.img:data.isGroup?GrpAvatar:avatar} className={`${style.profImg} ${data._online?style.online:""}`}></img>
        <div className={style.contactDiv}>
            <div className={style.contactName}>{data.isGroup?data.title:data.name}</div>
            <div className={style.contactLatest}>{`${data.sender&&data.sender!==user.email?data.sender+" :":""}${data.content?data.content:""}`}</div>
        </div>
        <div className={style.contactDiv2}>
        <div className={style.latestTime}>{data.time_stamp && formatTimestamp(data.time_stamp)}</div>
        {data.pending!==0 && <div className={style.pending}>{data.pending}</div>}
        </div>
    </div>
}
export default ContactUnit