const pool = require("./connection.js")
const express = require("express")
const {verifyToken} = require("./jwt.js")
const app = express()
const http = require("http")
const server = http.createServer(app)
const cookieParser = require("cookie-parser")
const { Server } = require("socket.io")
const AuthRouter = require("./routes/auth.js")
const sendMail = require("./nodeMailer.js")
const io = new Server(server, {
    pingTimeout: 180000,
    cors: {
        origin: "http://localhost:5173"
    }
})
const PORT = process.env.port || 8000
const cors = require("cors")

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req,res,cb){
        return cb(null,'./public/files')
    },
    filename:function (req,file,cb){
        return cb(null,`${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({storage})

 

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

const emitSystemMessage = async(socket,content,Rid,receiver)=>{
    
    const insert = await pool.query("insert into message (content) values(?)",[content])
    await pool.query("insert into message_channel (Rid,Mid) values (?,?)",[Rid,insert[0].insertId])
    const mess = await pool.query("select Mid,content,time_stamp from message where Mid = ?",[insert[0].insertId])
    await pool.query("update room set latest = ? where Rid = ?",[mess[0][0].Mid,Rid])
    if(receiver!=="undefined"){
        await pool.query("update room_channel set pending=pending+1 where Rid = ? and email = (select email from user where email = ? and _online = false)",[Rid,receiver]);
    }else{
        await pool.query("update room_channel set pending=pending+1 where Rid = ? and email in(select email from user where _online = false)",[Rid])
    }
    if(receiver){
        socket.join(receiver)
        socket.to(receiver).emit("emitMessage",{message:mess[0][0],receiver,Rid})
        socket.leave(receiver)
        return
    }
    
    socket.emit("emitMessage",{message:mess[0][0],receiver:null,Rid})
    socket.to(Rid).emit("emitMessage",{message:mess[0][0],receiver:null,Rid})
}

io.on("connection",async(socket)=>{

    socket.on("setup",async({email})=>{
        socket.email = email
        socket.join(email)
        await pool.query("update user set _online=true ,last_seen = current_timestamp() where email = ?",[socket.email])
        const grps = await pool.query("select * from room where Rid in (select Rid from room_channel where email = ?) and isGroup = true;",[email])
        grps[0].forEach(item=>socket.join(item.Rid))
        socket.broadcast.emit("newOnline",email)
    })
    socket.on("newGrp",async(data)=>{
        const result = await pool.query("select email from user where email in (select email from room_channel where Rid = ?) and email!=?",[data.Rid,socket.email])
        result[0].forEach(item=>{
            socket.join(item.email)
            socket.to(item.email).emit("newGrp",data)
            socket.leave(item.email)
        }) 
    })
    socket.on("joinGrp",(Rid)=>{
        socket.join(Rid)
    })
    
    socket.on("disconnect",async ()=>{
        await pool.query("update user set _online=false ,last_seen = current_timestamp() where email = ?",[socket.email])
        const result = await pool.query("select current_timestamp()")
        socket.broadcast.emit("newOffline",{email:socket.email,last_seen:result[0][0]["current_timestamp()"]})
    })
    socket.on("emitMessage",data=>{
        if(data.receiver){
            socket.join(data.receiver)
            socket.to(data.receiver).emit("emitMessage",data)
            socket.leave(data.receiver)
            return
        }
        socket.to(data.Rid).emit("emitMessage",data)
    })
    socket.on("incPending",async(Rid)=>{
        await pool.query("update room_channel set pending = pending+1 where email = ? and Rid = ?",[socket.email,Rid])
    })
    socket.on("typing", (data)=>{
        if(data.isGroup){
            socket.join(data.to)
            socket.to(data.to).emit("typing",data.Rid)
            socket.leave(data.to)
        }else{
            socket.to(data.to).emit("typing",data.Rid)
        }
    })
    socket.on("removeMember",async(data)=>{ 

        await pool.query("delete from room_channel where Rid = ? and email = ?",[data.Rid,data.confirmPerson])
        socket.to(data.Rid).emit("removeMember",data)
        socket.join(data.confirmPerson)
        socket.to(data.confirmPerson).emit("removed",data.Rid)
        socket.leave(data.confirmPerson)
        emitSystemMessage(socket,`${data.confirmPerson} was kicked out of the group by ${socket.email}`,data.Rid)

    })
    socket.on("addMember",async(data)=>{
        await pool.query("insert into room_channel (Rid,email) values (?,?)",[data.Rid,data.confirmPerson.email])
        socket.to(data.Rid).emit("addMember",{Rid:data.Rid,member:{...data.confirmPerson,isAdmin:false}})
        const result = await pool.query("select * from room where Rid = ?",[data.Rid])
        socket.join(data.confirmPerson.email)
        socket.to(data.confirmPerson.email).emit("newGrpAdded",{...result[0][0],content:null,pending:0,sender:null,senderName:null,time_stamp:null})
        socket.leave(data.confirmPerson.email)
        emitSystemMessage(socket,`${data.confirmPerson.email} was added to the group by ${socket.email}`,data.Rid)
    })
    
})



 
app.use("/auth",AuthRouter)

app.use((req, res, next) => {
    const token = req.cookies?.authToken
    let user
    try {
        user = verifyToken(token)
    } catch (err) {
        return res.status(400)
    }
    req.user = user
    next()
})

app.use("/file",express.static('public/files'))

app.get("/getContacts",async(req,res)=>{
    const {email} = req.user
    const friends = await pool.query("select user.email,friends.Rid,isGroup,friends.pending,user._online,content,time_stamp,sender.name as senderName,user.img,user.name,message.sender,user.last_seen from (select room.Rid,isGroup,latest,pending from (select * from room where isGroup = false) as room join (select pending,Rid from room_channel where email = ?) as selfRc on selfRc.Rid = room.Rid) as friends join (select * from room_channel where email!=?) as rc on rc.Rid = friends.Rid join user on rc.email=user.email left join message on message.Mid = friends.latest join user as sender on sender.email = message.sender",[email,email])
    const groups = await pool.query("select grps.Rid,title,grps.img,grps.img2,isGroup,pending,content,sender,time_stamp,name as senderName from (select * from room where isGroup = true) as grps join (select * from room_channel where email = ?) as rc on rc.Rid = grps.Rid left join message on message.Mid = latest left join user on user.email = sender",[email])
    return res.json({friends:friends[0],groups:groups[0]})
})

app.post("/getChats",async(req,res)=>{  
    const {Rid} = req.body;
    const data = await pool.query("select Mid,content,sender,time_stamp,name as senderName,attachment,mimetype from (select * from message where Mid in (select Mid from message_channel where Rid = ?)) as message left join user on email = sender;",[Rid])
    await pool.query("update room_channel set pending = 0 where Rid = ? and email = ?",[Rid,req.user.email])
    return res.json(data[0])
})  

app.post("/sendMessage",upload.single("file"),async(req,res)=>{
    const{content,receiver,Rid} = req.body;
    const file = req.file?.filename 
    const mimetype = req.file?.mimetype;
    const insert = await pool.query("insert into message (content,attachment,sender,mimetype) values(?,?,?,?)",[content,file,req.user.email,mimetype])
    await pool.query("insert into message_channel (Rid,Mid) values (?,?)",[Rid,insert[0].insertId])
    const mess = await pool.query("select Mid,attachment,content,sender,name as senderName,mimetype,time_stamp from message join user on user.email = sender and Mid = ?",[insert[0].insertId])
    await pool.query("update room set latest = ? where Rid = ?",[mess[0][0].Mid,Rid])
    if(receiver!=="undefined"){
        await pool.query("update room_channel set pending=pending+1 where Rid = ? and email = (select email from user where email = ? and _online = false)",[Rid,receiver]);
    }else{
        await pool.query("update room_channel set pending=pending+1 where Rid = ? and email in(select email from user where _online = false)",[Rid])
    }
    return res.json(mess[0][0])
}) 
 
app.post("/mkGrp",upload.array('imgs'),async(req,res)=>{
    const {caption,title,members} = req.body
    const memberObject =JSON.parse(members)
    const img = req.files[0]?.filename 
    const img2 = req.files[1]?.filename
    const result = await pool.query("insert into room (title,caption,isGroup,img,img2) values(?,?,true,?,?)",[title,caption,img,img2])
    let memberArray = [memberObject.map(member=>{
        return [result[0].insertId,member.email,member.admin]
    })]
    await pool.query("insert into room_channel (Rid,email,isAdmin) values ?",memberArray) 
    return res.json({Rid:result[0].insertId,caption,img,img2,isGroup:true,pending:0,sender:null,senderName:null,time_stamp:null,title})
}) 

app.post("/getMembers",async(req,res)=>{
    const {Rid} = req.body
    const data = await pool.query("select user.email,name,img,isAdmin from user join room_channel on room_channel.email=user.email where Rid = ?",[Rid])
    const data2 = await pool.query("select isAdmin from room_channel where Rid =? and email = ?",[Rid,req.user.email])
    return res.json({members:data[0],admin:data2[0][0]})
})

server.listen(PORT, () => {
    console.log("listening on port: ", PORT)
})   