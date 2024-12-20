import style from "./GrpInfo.module.css";
import socket from "./Socket";
const ConfirmGrpInfo = ({confirmMessage,setConfirm,setMembers,confirmPerson,confirmType,Rid})=>{
    const handleNo = ()=>{
        setConfirm(false)
    }
    const handleYes = ()=>{
        if(confirmType===1){
            socket.emit("removeMember",{Rid,confirmPerson})
            setMembers(prev=>
                prev.filter(item=>item.email!==confirmPerson)
            )
        }else if(confirmType===2){
            socket.emit("addMember",{Rid,confirmPerson})
            setMembers(prev=>[...prev,confirmPerson])
        }
        setConfirm(false)
    }
    return <div className={style.lightBox}>
        <div className={style.confirmBox}>
            <div className={style.confirmText}>
                {confirmMessage}
            </div>
            <div className={style.confirmControls}>
                <div onClick={handleYes} className={style.yes}>Yes</div>
                <div onClick={handleNo} className={style.no}>No</div>
            </div>
        </div>
    </div>
}
export default ConfirmGrpInfo