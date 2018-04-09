const express = require("express");
const path = require("path");
const app = express();
const router = express.Router();
const fpath = path.join(__dirname, "/")
var cors = require('cors')

app.use(express.static(fpath));
app.use(cors())

router.get("/",function(req,res){
	res.sendFile(fpath + "index.html")
})

app.use("*",router)

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname + '/anoda.html'));
// });

// app.listen(process.env.PORT || 3000, function(){
//   console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// });