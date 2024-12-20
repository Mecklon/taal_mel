import { useContext } from "react"
import { AuthContext } from "../store/authContextProvider"

export const useAuthContext = ()=>{
    const context = useContext(AuthContext)
    return context;
}

