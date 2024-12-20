import { useState } from 'react';
import { useChatContext } from '../hooks/useChatContext';
import style from './Chat.module.css'
import ContactUnit from './ContactUnit'
import { PiMagnifyingGlass } from "react-icons/pi";

const Contact = ({filter})=>{

    const {contacts} = useChatContext()
    const [search,setSearch] = useState("")

    const filteredContacts = contacts.filter(data => {
        const searchText = search.toLowerCase();
        const name = data.name?.toLowerCase() || "";
        const title = data.title?.toLowerCase() || "";
        const isSearchMatch = search === "" || name.includes(searchText) || title.includes(searchText);
        const isFilterMatch = (
            filter === 2 || 
            filter === 4 || 
            (filter === 1 && !data.isGroup) || 
            (filter === 3 && data.isGroup)
        );

        return isSearchMatch && isFilterMatch;
    });
    return <div className={style.contactWrapper}>
        <div className={style.searchWrapper}>
            <div className={style.searchIconWrapper}>
            <PiMagnifyingGlass className={style.searchIcon}/>
            </div>
            <input type="text" onChange={(e)=>setSearch(e.target.value)} className={style.search}/>
        </div>
        <div className={style.contacts}>
            {
                filteredContacts.map((data)=>{
                    return <ContactUnit key={data.Rid} data={data}></ContactUnit>
                })
            }
        </div>
        
    </div>
}
export default Contact