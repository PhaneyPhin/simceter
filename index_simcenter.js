var http = require('http')
 , compression = require('compression')
 , domain = require('domain')
 , serverDomain = domain.create()
 , cors = require('cors')
 , url = require('url')
 , express = require('express')
 , bodyParser = require('body-parser')
 ,multer = require('multer')
,sct = require('./service_simcenter');
var port = 3004
var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
var isUrl = new RegExp(expression);

var app = express();
app.use(cors());
app.use(bodyParser.json({limit: '100mb'}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit: '100mb'
}));

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/')
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
});

var upload = multer({ storage: storage });

serverDomain.run(function () {
    http.createServer(function (req, res,err) {
        try
        {
          var uid = req.url;
          console.log('uid is ' + uid)
            var reqd = domain.create()
            reqd.add(req)
            reqd.add(res)
            reqd.on('error', function(er) {
                console.error('Error', er, req.url);
                try {
                    res.status(404);
                } catch (er) {
                    console.error('Error sending 500', er, req.url);
                }
            });
            if (err)
            {
                console.error('Error', err, req.url);
            } else {
         
                app(req, res);
            }
        }catch(e){
            console.log(e.message)
        }

    }).listen(port)//, '127.0.0.1')
    console.log('service php Listening on port '+ port);
})

app.get('/get_login',sct.get_login)
app.get('/get_getconfig',sct.get_getconfig)
app.get('/get_getconfigExport',sct.get_getconfigExport)
app.get('/get_countupdate',sct.get_countupdate)
app.get('/get_ipreseive',sct.get_ipreseive)
app.get('/get_configBytime',sct.get_configBytime)
app.get('/get_configBytimeExport',sct.get_configBytimeExport)
app.post('/uploadexcel', upload.array("uploads[]", 12),sct.uploadexcel)
//app.post('/get_getconfigExportpost',[],sct.get_getconfigExportpost)
app.get('/get_getconfigExcelExport',sct.get_getconfigExcelExport)
