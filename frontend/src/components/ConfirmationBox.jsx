import style from './ConfirmationBox.module.css'
const ConfirmationBox = ({setConfirm,message})=>{
    return <div className={style.lightBox}>
        <div className={style.box}>
            <div className={style.question}>{message}</div>
        <div className={style.controls}>
            <div className={style.yes}>Yes</div>
            <div onClick={()=>setConfirm(false)} className={style.no}>No</div>
        </div>
        </div>
    </div>
}
export default ConfirmationBox