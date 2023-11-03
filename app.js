import express from 'express'
const app=express();
import mongoose from 'mongoose';
import shortid from 'shortid';

app.set('view engine', 'ejs');
const urlSchema=new mongoose.Schema({
    shortId:{
        type:String,
        required: true,
        default: shortid(),
        unique:true,
    },
    redirectURL:{
        type: String,
        required: true,
    },
    visitHistory:[{timestamp:{type:Number}}],
},{timestamps: true})

const URL=mongoose.model('url',urlSchema)

mongoose.connect('mongodb://127.0.0.1:27017/urlApp')
.then(()=>console.log("mongodb connected"))


app.use(express.urlencoded({extended: false}))
//static router

//routers
app.get('/',async(req,res)=>{
    const allUrl=await URL.find({});
    // return res.json(allUrl)
    res.render('index',{
        urls:allUrl,
    })
})
app.get("/url",(req,res)=>{
    res.send("url sent!")
})
app.post("/url",async(req,res)=>{
    const body=req.body;
    if(!body.url) return res.status(400).json({ error: 'url is required'})
    const shortID=shortid();
    // console.log(shortID);
    await URL.create({
        shortId: shortID,
        redirectURL:body.url,
        visitHistory:[],
    });
    return res.render('index',{
        id: shortID,
    })
})
app.get("/url/:shortId",async(req,res)=>{
    const shortId=req.params.shortId;
    const entry=await URL.findOneAndUpdate({
        shortId,
    },{
        $push:{
            visitHistory: {
                timestamp: Date.now(),
            },
        },
    }
    );
    return res.redirect(entry.redirectURL);
    // res.redirect(entry.redirectURL)
})
app.get('/analytics/:shortId',async(req,res)=>{
    const shortId=req.params.shortId;
    const result=await URL.findOne({shortId});
    return res.json({
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
    })
})
app.listen(3000,()=>{
    console.log("listening on port 3000...");
})