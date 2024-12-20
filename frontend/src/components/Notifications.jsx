import style from './Notifications.module.css'
import Notification from './Notification'
const Notifications = ()=>{
    return <div className={style.notifications}>
        <Notification data={{systemMess:false,isGroup:true,seen:true,img:null,time:12/12/12,type:1,name:"Mecklon Fernandes"}}></Notification>
        <Notification data={{systemMess:false,isGroup:true,seen:false,img:null,time:12/12/12,type:2,name:"test Group"}}></Notification>
        <Notification data={{systemMess:false,isGroup:true,seen:true,img:null,time:12/12/12,type:3,name:"test Group"}}></Notification>
        <Notification data={{systemMess:false,isGroup:true,seen:false,img:null,time:12/12/12,type:4,name:"Mecklon Fernandes"}}></Notification>
        <Notification data={{systemMess:false,isGroup:true,seen:false,img:null,time:12/12/12,type:5,name:"Mecklon Fernandes"}}></Notification>
        <Notification data={{systemMess:false,isGroup:true,seen:false,img:null,time:12/12/12,type:6,name:"Mecklon Fernandes"}}></Notification>
        <Notification data={{systemMess:true,isGroup:true,seen:false,img:null,time:12/12/12,type:7,name:"Test Ad"}}></Notification>
        <Notification data={{systemMess:true,isGroup:true,seen:false,img:null,time:12/12/12,type:8,name:"Test Ad",issue:"not music related"}}></Notification>
        <Notification data={{systemMess:true,isGroup:true,seen:false,img:null,time:12/12/12,type:9,name:"Test Ad",issue:"not music related"}}></Notification>

    </div>
}
export default Notifications