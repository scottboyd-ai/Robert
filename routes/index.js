var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname + 'public/index.html');
});

router.post('/', function(req, res, next){
    res.sendFile(process.cwd() + '/public/room.html');
});


module.exports = router;
