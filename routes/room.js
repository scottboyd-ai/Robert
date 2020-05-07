var express = require('express');
var router = express.Router();

/* GET room page. */

router.get('/', function(req, res, next) {
    res.sendFile(process.cwd() + '/public/room.html');
});

router.post('/', function(req, res, next){
    console.log('here');
})



module.exports = router;
