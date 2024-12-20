import { useChatContext } from "../hooks/useChatContext";
import GrpAvatar from "../assets/avatarGroup.jpg";
import style from "./GrpInfo.module.css";
import { IoPersonRemoveOutline } from "react-icons/io5";
import { IoPersonAddOutline } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";
import avatar from "../assets/defaultAvatar.png";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import ConfirmGrpInfo from "./ConfirmGrpInfo";
import socket from "./Socket";
const GrpInfo = ({ setGrpInfo }) => {
  const { currRoom, contacts } = useChatContext();
  const [contactSet, setContactSet] = useState(new Set());
  const [memberSet, setMemberSet] = useState(new Set());
  const [fetching, setFetching] = useState(false);
  const [members, setMembers] = useState([]);
  const { user } = useAuthContext();
  const admin = useRef(null);
  const [confirm, setConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [confirmPerson, setConfirmPerson] = useState(null);
  const [confirmMessage,setconfirmMessage] = useState(null)

  useEffect(() => {
    socket.on("removeMember", (data) => {
      if (currRoom.Rid === data.Rid)
        setMembers((prev) => prev.filter((item) => item.email !== data.confirmPerson));
    });
    socket.on("addMember",(data)=>{
      if(currRoom.Rid===data.Rid){
        setMembers(prev=>[...prev,data.member])
      }
    })
    return ()=>{
      socket.off("removeMember")
      socket.off("addMember")
    }
  }, [socket, setMembers,currRoom]);

  useEffect(() => {
    const set = new Set();
    contacts.forEach((item) => {
      if (item.isGroup) return;
      set.add(item.email);
    });
    setContactSet(set);
  }, [contacts]);
  useEffect(() => {
    const set = new Set();
    members.forEach((item) => {
      set.add(item.email);
    });
    setMemberSet(set);
  }, [members]);

  useEffect(() => {
    const getMembers = async () => {
      setFetching(true);
      const data = await fetch("http://localhost:8000/getMembers", {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Rid: currRoom.Rid,
        }),
      });
      const json = await data.json();

      setMembers(json.members);
      admin.current = json.admin;
      setFetching(false);
    };
    getMembers();
  }, [currRoom]);

  if (fetching) {
    return <div>fetching</div>;
  }

  const handleRemove = (email) => {
    setConfirm(true);
    setConfirmType(1);
    setConfirmPerson(email);
    setconfirmMessage(`Are you sure you want to kick ${email} out of ${currRoom.title}`)
  };
  const handleAdd = (email) => {
    setConfirm(true);
    setConfirmType(2);
    setConfirmPerson(email);
    setconfirmMessage(`Are you sure you want to add ${email.email} to ${currRoom.title}`)
  };

  return (
    <div className={style.grpInfoWrapper}>
      <div className={style.grpInfo}>
        <div className={style.imgWrapper}>
          <div className={style.back} onClick={() => setGrpInfo(false)}>
            <FaArrowLeft className={style.backIcon} />
          </div>
          <img
            src={
              currRoom.img2
                ? "http://localhost:8000/file/" + currRoom.img2
                : GrpAvatar
            }
            alt=""
            className={style.secImg}
          />
          <img
            src={
              currRoom.img
                ? "http://localhost:8000/file/" + currRoom.img
                : GrpAvatar
            }
            alt=""
            className={style.prImg}
          />
          <div className={style.title}>{currRoom.title}</div>
        </div>
        <div className={style.caption}>{currRoom.caption}</div>
        <div className={style.subTitle}>Members:</div>
        {members.map((item) =>
          !item.isGroup ? (
            <div key={item.email} className={style.member}>
              <img
                src={
                  item.img ? "http://localhost:8000/file/" + item.img : avatar
                }
                alt=""
                className={style.memberImg}
              />
              <div className={style.memberName}>
                {item.name}
                {item.email === user.email ? " (You)" : ""}
                { " ,"+item.email}
              </div>
              {item.isAdmin ? <div>Admin</div> : ""}
              {!contactSet.has(item.email) && item.email!==user.email && (
                <div className={style.memberButton}>
                  <IoPersonAddOutline className={style.memberButtonIcon} />
                </div>
              )}
              {!item.isAdmin && admin && item.email!==user.email &&(
                <div
                  onClick={() => handleRemove(item.email)}
                  className={style.memberButton}
                >
                  <IoPersonRemoveOutline className={style.memberButtonIcon} />
                </div>
              )}
            </div>
          ) : (
            ""
          )
        )}
        {!contactSet.isSubsetOf(memberSet) && (
          <div className={style.subTitle}>Add your friends to the group:</div>
        )}
        {contacts.map((item) =>
          !item.isGroup && !memberSet.has(item.email) ? (
            <div key={item.email} className={style.member}>
              <img
                src={
                  item.img ? "http://localhost:8000/file/" + item.img : avatar
                }
                alt=""
                className={style.memberImg}
              />
              <div className={style.memberName}>{item.name}{ " ,"+item.email}</div>
              <div
                onClick={() => handleAdd(item)}
                className={style.memberButton}
              >
                <IoPersonAddOutline className={style.memberButtonIcon} />
              </div>
            </div>
          ) : (
            ""
          )
        )}
      </div>

      {confirm && (
        <ConfirmGrpInfo
          setConfirm={setConfirm}
          confirmType={confirmType}
          setMembers={setMembers}
          confirmPerson={confirmPerson}
          Rid={currRoom.Rid}
          confirmMessage={confirmMessage}
        />
      )}
    </div>
  );
};

export default GrpInfo;