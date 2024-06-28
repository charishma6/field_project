//create express app
const exp = require("express");
const app = exp();
require('dotenv').config() //process.env.PORT
const mongoClient=require('mongodb').MongoClient;
const path=require('path')
const portfinder = require('portfinder');

//deploy react build in this server
app.use(exp.static(path.join(__dirname,'../client/build')))
//to parse the body of req
app.use(exp.json())


//connect to DB 
mongoClient.connect(process.env.DB_URL)
.then(client=>{
    //get db obj
    const fp=client.db('fieldproject')
    //get collection obj
    const hodcollection=fp.collection('hodcollection')
    const facultycollection=fp.collection('facultycollection')
    const admincollection=fp.collection('admincollection')
    const timetablecollection=fp.collection('timetablecollection')
    const classcollection=fp.collection('classcollection')
    const labscollection=fp.collection('labscollection')
    const bookedclassescollection=fp.collection('bookedclassescollection')
    const bookedlabscollection=fp.collection('bookedlabscollection')
    const leavescollection=fp.collection('leavescollection')
    const reassignmentscollection=fp.collection('reassignmentscollection')



    //share collection obj with express app
    app.set('hodcollection',hodcollection)
    app.set('facultycollection',facultycollection)
    app.set('admincollection',admincollection)
    app.set('timetablecollection',timetablecollection)
    app.set('classcollection',classcollection)
    app.set('labscollection',labscollection)
    app.set('bookedclassescollection',bookedclassescollection)
    app.set('bookedlabscollection',bookedlabscollection)
    app.set('leavescollection',leavescollection)
    app.set('reassignmentscollection',reassignmentscollection)
    
    //confirm db connection status
    console.log("DB connection success")})
.catch(err=>console.log("Err in DB connection",err))

//import API routes
const hodApp=require('./APIs/hod-api')
const facultyApp=require('./APIs/faculty-api')
const adminApp=require('./APIs/admin-api')

//if path starts with hod-api, send req to hodApp
app.use('/hod-api',hodApp)
//if path starts with faculty-api, send req to facultyApp
app.use('/faculty-api',facultyApp)
//if path starts with admin-api, send req adminApp
app.use('/admin-api',adminApp)

app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,'../client/build/index.html'))
})

//express error handler
app.use((err,req,res,next)=>{
    res.send({message:"error",payload:err.message})
})


// Generate JWT token endpoint (for testing)
app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = { username };
  
    const accessToken = jwt.sign(user, config.secretKey, { expiresIn: '1h' });
    res.json({ accessToken });
  });



  portfinder.getPort((err, port) => {
    if (err) {
      console.error('Error finding port:', err);
      return;
    }
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  });
  
/* //assign port number
const port=process.env.PORT || 3000;
app.listen(port,()=>console.log(`Web server on port ${port}`)) */