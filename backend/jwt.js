const jwt = require("jsonwebtoken")
const key = "mecklon_fernandes"

const makeToken = (email)=>{
    const payload = {
        email
    }
    const token = jwt.sign(payload,key,{expiresIn:'1d'})
    return token
}

const verifyToken = (token)=>{
    let data
    try{
        data = jwt.verify(token,key)
    }catch(err){
        throw new Error("Session time out")
    }
    return data
}

module.exports = {makeToken,verifyToken}