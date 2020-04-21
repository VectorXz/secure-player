var express = require('express');
var multer = require('multer');
var fs = require('fs');
var path = require('path')
var CryptoJS = require("crypto-js");


var app = express();
app.use(express.static('uploads'))

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })
   
var upload = multer({ storage: storage })


app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('encodeFileInput'), function(req, res) {
    var fileObj = fs.readFileSync(req.file.path);
    var encode64file = fileObj.toString('base64');
    var ciphertext = CryptoJS.AES.encrypt(encode64file, 'thisissecret').toString();
    let fileName = Date.now()+".enf";
    fs.writeFile("uploads/"+fileName, ciphertext, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The Encoded file was saved!");
    });
    fs.unlink(req.file.path, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('Original File deleted!');
    });
    fs.readFile(__dirname + '/download.html', (err, html) => {
        let htmlPlusData = html.toString().replace("<-LINK->", fileName);
            res.send(htmlPlusData);
    });
});

app.post('/decode', upload.single('decodeFileInput'), function(req, res) {
    //res.send(req.file);
    console.log(req.file);
    var fileObj = fs.readFileSync(req.file.path);
    //console.log(fileObj.toString());
    var bytes  = CryptoJS.AES.decrypt(fileObj.toString(), 'thisissecret');
    console.log("Pass")
    var base64Txt = bytes.toString(CryptoJS.enc.Utf8);
    //console.log(base64Txt);
    console.log("pass2")
    let buff = new Buffer(base64Txt, 'base64');
    let time = Date.now();
    fs.writeFileSync('uploads/'+time+'.mp3', buff);
    fs.readFile(__dirname + '/player.html', (err, html) => {
        let htmlPlusData = html.toString().replace("<-DATA->", time+'.mp3');
            res.send(htmlPlusData);
    });

});

app.listen(80, function() {
	console.log('App running on port 5555');
});