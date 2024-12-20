import { useEffect, useState } from "react";
import style from "./Chat.module.css";
import Contact from "./Contact";
import Dialog from "./Dialog";
import Mkgrp from "./Mkgrp";
import ChatNav from "./ChatNav";
import ChatContextProvider from "../store/ChatContextProvider";

const Chat = () => {
  const [filter,setFilter] = useState(2)
  return (
    <ChatContextProvider>
      <div className={style.chatWrapper}>
        <div className={style.chat}>
          <ChatNav setFilter={setFilter} filter={filter}></ChatNav>
          {filter !==4 && <Contact filter={filter} setFilter={setFilter}></Contact>}
          {filter !==4 ?<Dialog></Dialog>: <Mkgrp setFilter={setFilter}></Mkgrp>}
        </div>
      </div>
    </ChatContextProvider>
  );
};
export default Chat;
