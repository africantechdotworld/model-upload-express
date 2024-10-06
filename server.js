
//LOCALHOST TEST
const express = require('express'); 
var fs = require('fs');
var cors = require('cors')
//const { v4: uuidv4 } = require('uuid');
const compression = require('compression')
var multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
//var bodyParser = require('body-parser');



//var fs = require('fs-extra'); //npm install fs.extra
const helmet = require('helmet')






// Creating instance of express 
const app = express(); 

// Allow iframe embedding for all websites
// app.use(
//   helmet({
//     frameguard: false,
//     contentSecurityPolicy: false
//   }),
// );


app.use(cors());

app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


//app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression())





app.use(express.json({limit: '1000mb'}));

app.use(express.static('public'))
app.use(express.static('saved_scenes'))
  
// Handling GET / Request 
app.get('/', function (req, res) { 
    res.send("Hello World!, I am server created by expresss"); 
    
}) 

app.post("/upload_models", upload.array("files"), function (req, res, next) {
  const dirname = req.body.directory;
  const files = [];
  var fileKeys = Object.keys(req.files);

  fileKeys.forEach(function(key) {
      files.push(req.files[key]);
  });


  try {
    fs.mkdirSync(__dirname + '/saved_scenes/' + dirname, { recursive: true }, (err) => {
        if (err) throw err;
      });

   
      files.forEach((file)=>
      {
        fs.writeFileSync( __dirname + '/saved_scenes/' + dirname + "/" + file.originalname, file.buffer, {flag: "w"});
      })
      
      // file written successfully
    } catch (err) {
        console.error(err);
        res.status(500).send({error: err})
    }

  res.status(200).send({message: "OK"})



  
})
app.post('/fileupload', function (req, res) { 
    

    

    const id = req.body.id;


    const sound_content = req.body.soundFile;
    const sound_file_name = req.body.soundFileName;
    
    if(req.body.soundFile)
    {
    try {
        //const extension = filename.split('.').pop();
        fs.writeFileSync( __dirname + '/saved_scenes/' + id + "/sound_file", sound_content, {flag: "w"});
        // file written successfully
      } catch (err) {
        console.error(err);
        res.status(500).send({error: err})
      }
    }


    const cubemap = req.body.cubemap;
    if(cubemap)
    {
    try {
        //const extension = filename.split('.').pop();
        fs.mkdirSync(__dirname + '/saved_scenes/' + id + "/cubemap_textures", { recursive: true }, (err) => {
          if (err) throw err;
        });
        fs.writeFileSync( __dirname + '/saved_scenes/' + id + "/cubemap_textures" + "/px_data_url", cubemap.px_data_url, {flag: "w"});
        fs.writeFileSync( __dirname + '/saved_scenes/' + id + "/cubemap_textures" + "/nx_data_url", cubemap.nx_data_url, {flag: "w"});
        fs.writeFileSync( __dirname + '/saved_scenes/' + id + "/cubemap_textures" + "/py_data_url", cubemap.py_data_url, {flag: "w"});
        fs.writeFileSync( __dirname + '/saved_scenes/' + id + "/cubemap_textures" + "/ny_data_url", cubemap.ny_data_url, {flag: "w"});
        fs.writeFileSync( __dirname + '/saved_scenes/' + id + "/cubemap_textures" + "/pz_data_url", cubemap.pz_data_url, {flag: "w"});
        fs.writeFileSync( __dirname + '/saved_scenes/' + id + "/cubemap_textures" + "/nz_data_url", cubemap.nz_data_url, {flag: "w"});
        // file written successfully
      } catch (err) {
        res.status(500).send({error: err})
      }
    }

    const image_background = req.body.image_background;
    if(image_background)
    {
    try {
        //const extension = filename.split('.').pop();
        fs.mkdirSync(__dirname + '/saved_scenes/' + id + "/background_texture", { recursive: true }, (err) => {
          if (err) throw err;
        });
        fs.writeFileSync( __dirname + '/saved_scenes/' + id + "/background_texture" + "/background_image_data_url", image_background.image, {flag: "w"});
        // file written successfully
      } catch (err) {
        res.status(500).send({error: err})
      }
    }

    
    try {
      fs.writeFileSync( __dirname + '/saved_scenes/' + id + "/fileList.json", JSON.stringify(req.body.fileList), {flag: "w"});
      // file written successfully
    } catch (err) {
      res.status(500).send({error: err})
    }

    




    console.log("id", id)
    res.status(200).send({ id: id});
    //res.end();
}) 
  
// Listening to server at port 80
app.listen(80, function () { 
    console.log("Server started at port 80");
})

 




