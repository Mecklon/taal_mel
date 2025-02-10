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
const { read } = require("fs")
const storage = multer.diskStorage({
    destination: function (req,res,cb){
        return cb(null,'./public/files')
    },
    filename:function (req,file,cb){
        return cb(null,`${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({storage})

const formatDateForMySQL = (date) => {
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const getDateRange = (timeCode) => {
    const now = new Date();
    switch (timeCode) {
      case 1: // Today
        now.setHours(0, 0, 0, 0);
        break;
      case 2: // Last week
        now.setDate(now.getDate() - 7);
        break;
      case 3: // Last month
        now.setMonth(now.getMonth() - 1);
        break;
      case 4: // Last year
        now.setFullYear(now.getFullYear() - 1);
        break;
      case 5: // All time
        return null; // No date filter
      
    }
  
    return formatDateForMySQL(now); // Format the date for MySQL
  };
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

app.post("/chunk3",async (req,res)=>{
    const {chunk} = req.body
    const data = await pool.query("select Mid,content,sender,time_stamp,name as senderName,attachment,mimetype from (select * from message where Mid in (select Mid from message_channel)) as message left join user on email = sender order by time_stamp desc limit 10 offset ?",[chunk*10])
  
    return res.json({list:data[0],hasMore:data[0].length!==0})
})



app.use("/auth",AuthRouter)

app.use((req, res, next) => {
    const token = req.cookies?.authToken
    let user
    try {
        user = verifyToken(token)
    } catch (err) {
        console.log("denied")
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

  


app.post("/getProfData",async (req,res)=>{
    const {email} = req.body;
    const data = await pool.query("select name,img,img2,email,bio from user where email = ?",[email]);
    const genre = await pool.query("select Gid,genreName from genre where Gid in (select Gid from user_genre where email = ?)",[email])
    const instrument = await pool.query("select Iid,instrumentName from instrument where Iid in (select Iid from user_instrument where email = ?)",[email]);
    const location = await pool.query("select * from (select * from city where Cid = (select Cid from user where email = ?)) as c join state on c.Sid = state.Sid; ",[req.user.email])
    return res.json({...data[0][0],genre:genre[0],instrument:instrument[0],location:location[0][0]});
})

app.get('/getInstrumentPredict/:word',async(req,res)=>{
    const word = req.params.word;
    const predicts = await pool.query("select instrumentName,Iid from instrument where instrumentName like ?",[`%${word}%`]);
    return res.json(predicts[0]);
})

app.get("/getGenrePredicts/:word",async(req,res)=>{
    const word = req.params.word;
    const predicts = await pool.query("select genreName,Gid from genre where genreName like ?",[`%${word}%`]);
    return res.json(predicts[0]);
})

app.post("/editProfile",upload.array("imgs"),async(req,res)=>{
    const {bio,instrumentRemoved,genreRemoved,instrumentAdded,genreAdded} = req.body;
    let {Cid} = req.body
    Cid = Cid==="undefined"?null:Cid;


    const genreRemovedArray = JSON.parse(genreRemoved)
    const instrumentRemoveArray = JSON.parse(instrumentRemoved)
    const instrumentAddedArray = JSON.parse(instrumentAdded)
    const genreAddedArray = JSON.parse(genreAdded)
    const img = req.files[0]?.filename? req.files[0]?.filename:null; 
    const img2 = req.files[1]?.filename? req.files[1]?.filename:null; 
    
    if(img&&img2){
        await pool.query("update user set bio = ?, img= ? , img2=? where email = ?",[bio,img,img2,req.user.email])
    }else if(img){
        await pool.query("update user set bio = ?, img= ? where email = ?",[bio,img,req.user.email])
    }else if(img2){
        await pool.query("update user set bio = ?, img2= ? , img2=? where email = ?",[bio,img2,req.user.email])
    }else{
        await pool.query("update user set bio = ?  where email = ?",[bio,req.user.email])
    }

    if(Cid){
        await pool.query("update user set Cid = ? where email = ?",[Cid,req.user.email])
    }
    if(genreAddedArray.length>0){
        await pool.query("insert into user_genre (Gid,email) values ?",[genreAddedArray.map(item=>[item,req.user.email])])
    }
    if(instrumentAddedArray.length>0){
        await pool.query("insert into user_instrument (Iid,email) values ?",[instrumentAddedArray.map(item=>[item,req.user.email])])
    }
    for(const Gid of genreRemovedArray){
        await pool.query("delete from user_genre where email = ? and Gid = ?",[req.user.email,Gid])
    }
    for(const Iid of instrumentRemoveArray){
        await pool.query("delete from user_instrument where email = ? and Iid = ?",[req.user.email,Iid])
    }

    const data = await pool.query("select name,img,img2,email,bio from user where email = ?",[req.user.email]);
    const genre = await pool.query("select Gid,genreName from genre where Gid in (select Gid from user_genre where email = ?)",[req.user.email])
    const instrument = await pool.query("select Iid,instrumentName from instrument where Iid in (select Iid from user_instrument where email = ?)",[req.user.email]);
    const location = await pool.query("select * from (select * from city where Cid = (select Cid from user where email = ?)) as c join state on c.Sid = state.Sid; ",[req.user.email])
    return res.json({...data[0][0],genre:genre[0],instrument:instrument[0],location:location[0][0]});
}) 

app.post('/newPost',upload.single("file"),async(req,res)=>{
    const {title,desc,instrument,genre} = req.body;
    const instrumentArray  = JSON.parse(instrument)
    const genreArray = JSON.parse(genre) 
    const file = req.file.filename 
    const mimetype = req.file.mimetype; 
    const result = await pool.query("insert into post (postType,media,mediaType,email) values (1,?,?,?)",[file,mimetype,req.user.email]);
    for(const item of genreArray){
        await pool.query("insert into genre_post (Gid,Pid) values (?,?)",[item.Gid,result[0].insertId])
    }
    for(const item of instrumentArray){
        await pool.query("insert into instrument_post (Iid,Pid) values (?,?)",[item.Iid,result[0].insertId])
    }
    const result2 = await pool.query("insert into profilePost (title,content,Pid) values (?,?,?)",[title,desc,result[0].insertId])
    return res.json({postId:result2[0].insertId}); 
})

app.get('/getProfilePosts/:email',async(req,res)=>{
    const email = req.params.email
    const data = await pool.query("select * from (select * from post where email = ? and postType = 1) as p join profilepost on profilePost.pid = p.pid;",[email])
    return res.json(data[0])
})

app.get("/getPost/:id",async(req,res)=>{
    const id = req.params.id;
    const data = await pool.query("select * from (select * from post where pid = ?)as p join profilePost on profilePost.Pid = p.Pid",[id]);
    const email = data[0][0].email
    const genre = await pool.query("select * from genre_post where Pid = ?",[id,email])
    const instrument = await pool.query("select * from instrument_post where Pid = ?",[id,email])
    const user = await pool.query("select name,email,img from user where email = ?",[email])
    const like = await pool.query("select * from likee where email = ? and PPid = ?",[req.user.email,data[0][0].PPid])
    
    return res.json([{data:data[0][0],user:user[0][0],email,genre:genre[0],instrument:instrument[0],like:like[0][0]?.type!==null?like[0][0]?.type:null}])
})

 
app.post('/upVote',async(req,res)=>{
    const {code,PPid} = req.body;
    if(code!==3){
        await pool.query("delete from likee where email = ? and PPid = ?",[req.user.email,PPid])
    }
    if(code!==1){
        await pool.query("insert into likee (type,email,PPid) values (true,?,?)",[req.user.email,PPid])
    }
    if(code ===1){
        await pool.query('update profilePost set likes = likes-1 where PPid = ?',[PPid])
    }else if(code ===2){
        await pool.query('update profilePost set dislikes = dislikes-1, likes=likes+1 where PPid = ?',[PPid])
    }else{
        await pool.query("update profilePost set likes = likes +1 where PPid = ?",[PPid])
    }
    return res.status(200)
}) 

app.post('/downVote',async(req,res)=>{
    const {code,PPid} = req.body;
    if(code !== 3){
        await pool.query("delete from likee where email = ? and PPid = ?",[req.user.email,PPid])
    }
    if(code!==1){
        await pool.query("insert into likee (type,email,PPid) values (false,?,?)",[req.user.email,PPid])
    }
    if(code ===1){
        await pool.query("update profilePost set dislikes = dislikes -1 where PPid = ?",[PPid])
    }else if(code === 2){
        await pool.query("update profilePost set dislikes = dislikes + 1, likes = likes -1 where PPid = ?",[PPid])
    }else{
        await pool.query("update profilePost set dislikes = dislikes + 1 where PPid = ?",[PPid])
    }
    return res.status(200)
})  

app.get("/getComments/:id/:page",async(req,res)=>{
    const {id,page} = req.params;
    const data = await pool.query("select Coid,content,user.email,img,name,time_created from (select * from comment where PPid = ?) as c join user on user.email = c.email  order by time_created desc limit 10 offset ?",[id,page*10])
    return res.json(data[0])
})

 
app.post("/postComment",async(req,res)=>{
    const {content,PPid} = req.body;
    const result1 = await pool.query("insert into comment (content,email,PPid) values (?,?,?)",[content,req.user.email,PPid]);
    await pool.query("update profilePost set comments = comments + 1 where PPid = ?",[PPid]);

    const result2 = await pool.query("select Coid,content,user.email,img,name,time_created from (select * from comment where Coid = ?) as c join user on user.email = c.email",[result1[0].insertId])
    return res.json(result2[0][0])
})


app.get("/getCity/:word",async(req,res)=>{
    const {word} = req.params
    const data = await pool.query("select * from(select * from city where cityName like ?) as c join state on state.Sid = c.Sid",[`%${word}%`])
    return res.json(data[0])
})

app.get('/getState/:word',async(req,res)=>{
    const {word} = req.params;
    const data = await pool.query("select * from state where stateName like ?",[`%${word}%`])
    return res.json(data[0])
})

app.post("/getPosts",async(req,res)=>{
    const {search,genre,instrument,state,city,time} = req.body;
    const range = getDateRange(time) 
    let parameters = []  
    parameters.push((search)?`%${search}%`:"%%")
    parameters.push(range?range:"2023-01-29 19:39:07")

 
    let query = "select post.Pid,postDate,media,mediaType,user.email,views,profilePost.PPid,title,content,likes,dislikes,comments,user.name,user.img from (select * from profilePost where title like ?) as profilePost join (select * from post where postDate > ?) as post on post.Pid = profilePost.Pid join user on user.email = post.email"
    if(genre){
        query+= " join genre_post on genre_Post.Pid = post.Pid"
    }
    if(instrument){
        query+= " join instrument_post on instrument_Post.Pid = post.Pid"
    }
    if(city){
        query+= " join city on city.Cid = user.Cid"
    }
    if(!city && state){
        query+= " join city on user.cid = city.cid join state on city.Sid = state.Sid"
    }
    let oneParameterFlag = true;
    if(genre){
        query += " where Gid = ?"
        oneParameterFlag = false;
        parameters.push(genre)
    }
    if(instrument){
        query += (oneParameterFlag?" where ":" and ")+"Iid = ?"
        oneParameterFlag = false; 
        parameters.push(instrument)
    }
    if(city){
        query += (oneParameterFlag?" where ":" and ")+"city.Cid = ?"
        oneParameterFlag = false;
        parameters.push(city)
    }
    if(!city && state){
        query += (oneParameterFlag?" where ":" and ")+"state.Sid = ?"
        oneParameterFlag = false;
        parameters.push(state)
    }
    query += " order by views";
    const data = await pool.query(query,parameters)
    let result = []
    for(let i=0;i<data[0].length;i++){

        const like = await pool.query("select * from likee where email = ? and PPid = ?",[req.user.email,data[0][i].PPid])
        const genre = await pool.query("select * from genre_post join genre on genre.Gid = genre_post.Gid where Pid = ?",[data[0][i].Pid])
        const instrument = await pool.query("select * from instrument_post join instrument on instrument.Iid = instrument_post.Iid where Pid = ?",[data[0][i].Pid])
        result.push({data:data[0][i],email:data[0][i].email,genre:genre[0],instrument:instrument[0],like:like[0][0]?.type!==null?like[0][0]?.type:null,user:{email:data[0][i].email,img:data[0][i].img,name:data[0][i].name}})
    }


    return res.json(result)
})

app.post("/makeJobPost",async(req,res)=>{
    const {title,remote,payment,jobType,location,genres,instruments,requirements,responsibilities,jobDesc} = req.body
    const result = await pool.query("insert into post (email,postType) values (?,?)",[req.user.email,2])
    const result2 = await pool.query("insert into jobPost (description,title,Pid,payment_details,responsibilities,requirements,type,Cid,remote) values (?,?,?,?,?,?,?,?,?)",[jobDesc,title,result[0].insertId,payment,responsibilities,requirements,jobType,location,remote]);
    for(const item of genres){
        await pool.query("insert into genre_post (Gid,Pid) values (?,?)",[item.Gid,result[0].insertId])
    }
    for(const item of instruments){
        await pool.query("insert into instrument_post (Iid,Pid) values (?,?)",[item.Iid,result[0].insertId])
    }
    const data = await pool.query("select post.Pid,postDate,views,Jid,description,title,payment_details,responsibilities,remote,requirements,type,city.cid,state.sid,remote,cityName,stateName,name,img from (select * from post where pid = ? and postType = 2) as post join jobPost on jobPost.pid = post.pid join city on city.cid = jobpost.Cid join state on state.sid = city.sid join user on user.email = post.email",[result[0].insertId])
    return res.json(data[0][0])
})

app.get("/getYourJobPosts",async(req,res)=>{
    const data = await pool.query("select remote,post.Pid,postDate,views,Jid,description,title,payment_details,responsibilities,requirements,type,city.cid,state.sid,remote,cityName,stateName,name,img,user.email from (select * from post where email = ? and postType = 2) as post join jobPost on jobPost.pid = post.pid join city on city.cid = jobpost.Cid join state on state.sid = city.sid join user on user.email = post.email order by postDate desc",[req.user.email])
    result = []
    for(let i=0;i<data[0].length;i++){
        const genre = await pool.query("select * from genre_post join genre on genre.Gid = genre_post.Gid where Pid = ?",[data[0][i].Pid])
        const instrument = await pool.query("select * from instrument_post join instrument on instrument.Iid = instrument_post.Iid where Pid = ?",[data[0][i].Pid])
        const applicants = await pool.query("select user.email,name,img from (select * from user_jobPost where Jid = ?) as uj join user on user.email = uj.email",[data[0][i].Jid])
        result.push({data:data[0][i],email:data[0][i].email,genre:genre[0],instrument:instrument[0],user:{email:data[0][i].email,img:data[0][i].img,name:data[0][i].name},applicants:applicants[0]})
    }
    return res.json(result)
})

app.post("/getJobPosts",async(req,res)=>{

    const {search,genre,instrument,state,city,time,remote} = req.body;
    const range = getDateRange(time) 
    let parameters = []  
    parameters.push((search)?`%${search}%`:"%%")
    parameters.push(remote)
    parameters.push(range?range:"2023-01-29 19:39:07")

 
    let query = "select post.Pid,type,remote,payment_details,description,responsibilities,requirements,postDate,media,mediaType,user.email,views,jobPost.Jid,title,user.name,user.img,stateName,cityName from (select * from jobPost where title like ? and remote = ?) as jobPost join (select * from post where postDate > ?) as post on post.Pid = jobPost.Pid join user on user.email = post.email join city on user.cid = city.cid join state on city.Sid = state.Sid"
    if(genre){
        query+= " join genre_post on genre_Post.Pid = post.Pid"
    }
    if(instrument){
        query+= " join instrument_post on instrument_Post.Pid = post.Pid"
    }
    let oneParameterFlag = true;
    if(genre){
        query += " where Gid = ?"
        oneParameterFlag = false;
        parameters.push(genre)
    }
    if(instrument){
        query += (oneParameterFlag?" where ":" and ")+"Iid = ?"
        oneParameterFlag = false; 
        parameters.push(instrument)
    }
    if(city){
        query += (oneParameterFlag?" where ":" and ")+"city.Cid = ?"
        oneParameterFlag = false;
        parameters.push(city)
    }
    if(!city && state){
        query += (oneParameterFlag?" where ":" and ")+"state.Sid = ?"
        oneParameterFlag = false;
        parameters.push(state)
    }
    query += " order by views desc, postDate desc";

    const data = await pool.query(query,parameters)
    let result = []
    for(let i=0;i<data[0].length;i++){
        const genre = await pool.query("select * from genre_post join genre on genre.Gid = genre_post.Gid where Pid = ?",[data[0][i].Pid])
        const instrument = await pool.query("select * from instrument_post join instrument on instrument.Iid = instrument_post.Iid where Pid = ?",[data[0][i].Pid])
        const applied = await pool.query("select * from user_jobpost where jid = ? and email = ?",[data[0][i].Jid,req.user.email])
        result.push({data:data[0][i],email:data[0][i].email,genre:genre[0],instrument:instrument[0],user:{email:data[0][i].email,img:data[0][i].img,name:data[0][i].name},applied:applied[0].length!==0})
    }
    return res.json(result)
})

app.get("/apply/:id",async(req,res)=>{
    const {id} = req.params
    const data = await pool.query("insert into user_jobPost (email,Jid) values (?,?)",[req.user.email,id])
    return res.json("ok")
})

app.get('/cancelApplication/:id',async(req,res)=>{
    const {id} = req.params
    const data = await pool.query("delete from user_jobPost where email = ? and Jid = ?",[req.user.email,id])
    return res.json("ok")
    
})

app.get("/getApplications",async(req,res)=>{
    const data = await pool.query("select * from (select * from user_jobPost where email =?) as uj join jobPost on uj.Jid = jobPost.jid join post on post.Pid = jobPost.pid join city on city.Cid = jobPost.Cid join state on state.Sid = city.Sid order by postDate desc;",[req.user.email])
    const result = []
    for(let i=0;i<data[0].length;i++){
        const genre = await pool.query("select * from genre_post join genre on genre.Gid = genre_post.Gid where Pid = ?",[data[0][i].Pid])
        const instrument = await pool.query("select * from instrument_post join instrument on instrument.Iid = instrument_post.Iid where Pid = ?",[data[0][i].Pid])
        
        result.push({data:data[0][i],email:data[0][i].email,genre:genre[0],instrument:instrument[0],user:{email:data[0][i].email,img:data[0][i].img,name:data[0][i].name},applied:true})
    }
    return res.json(result)
})

app.get("/getOtherProfile:email",async(req,res)=>{
    const {email} = req.params;
    console.log(email)
    return res.json("ok")
})

app.get('/upViews/:Pid',async(req,res)=>{
    const {Pid} = req.params;
    console.log(Pid)
    await pool.query("update post set views = views +  1 where Pid = ? ",[Pid])
    return res.json("ok")
})

server.listen(PORT, () => {
    console.log("listening on port: ", PORT)
})      