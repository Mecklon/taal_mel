const { makeToken, verifyToken } = require("../jwt.js")
const pool = require("../connection.js")
const bcrypt = require("bcrypt")
const sendMail = require("../nodeMailer.js")


const handleSignup = async (req, res) => {
    const {email} = req.body

    await pool.query("delete from otp where email = ?",[email])
    const data = await pool.query("select * from user where email = ?",[email])
    if(data[0].length!==0){
        return res.status(400).json({ index: 2, error: "An account associated to this email already exists" })
    }

    const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    await pool.query("insert into otp (email,otp) values (?,?)",[email,otp])
    sendMail(email,otp)
    return res.json("ok")

}

const handleOtp = async(req,res)=>{
    let {name,email,password,otp} = req.body
    console.log(name,email,password,otp)
    const data = await pool.query("select * from otp where email = ?",[email])
    console.log(data)
    if(data[0].length===0){
        return res.status(400).json({error:"opt timeout"})
    }
    if(data[0][0].otp!==otp){
        return res.status(400).json({error:"Incorrect OTP"})

    }
    try {
        password = await bcrypt.hash(password, 12)
        await pool.query("insert into user (name,email,password) values (?,?,?)", [name, email, password])
    } catch (error) {
        return res.status(400).json({error:"something went wrong"})
    }
    const token = makeToken({email,name})
    res.cookie("authToken", token, { maxAge: 990000 })
    return res.json({email,name})
}

const handleLogout = (req, res) => {
    res.clearCookie("authToken")
    return res.json("logged out")
}

const handleLogin = async (req, res) => {
    let { email, password } = req.body
    let user = await pool.query("select * from user where email = ?", [email])

    if (user[0].length === 0) {
        return res.status(400).json({index:1, error: "User does not exist" })
    }

    let validated
    validated = await bcrypt.compare(password, user[0][0].password)

    if (!validated) return res.status(404).json({index:2, error: "Incorrect password" })
    /* if(user[0][0]._online==="Y") return res.status(400).json({error:"you are logged in from a different device"}) */ // commented because the servers stops sometimes leaving the user online thus making the app not accessible
    const token = makeToken(email)
    res.cookie("authToken", token, { maxAge: 990000 })
    return res.status(200).json({ name: user[0][0].name, email })
}

const handleAutoLogin = async (req, res) => {
    const token = req.cookies?.authToken
    if (!token) {
        return res.status(400).json({ error: "User not logged in" })
    }
    let data;
    try {
        data = verifyToken(token)
    } catch (err) {
        return res.status(400).json({ error: err })
    }
    const user = await pool.query("select * from user where email = ?", [data.email])
    return res.status(200).json({ email: data.email, name: user[0][0].name })
}

module.exports = {handleSignup,handleAutoLogin,handleLogin,handleLogout,handleOtp}