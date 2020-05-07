var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var room = require('./routes/room');
var SpeakerList = require('./bin/SpeakerList');
var Motion = require('./bin/Motion');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];
var speakerLists = [];
var speakerList = new SpeakerList();
speakerLists.push(speakerList);

var motion;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/room', room);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

io.on('connection', function (socket) {
    console.log('connection');
    io.emit('chat message', 'A user has connected');
    socket.on('message', function (data) {
        signIn(socket, data);
        io.emit('chat message', (data + ' user has entered the room'));
    });
    socket.on('chat message', function (msg) {
        var user = getUser(socket.id, msg.id);
        if(user){
            io.emit('chat message', {name: user.name, msg: msg.msg});
        }
    });
    socket.on('speak', function(id){
        var speaker = getUser(socket.id, id);
        var list = getSpeakerList();
        list.addSpeaker(speaker);
        io.emit('speaker list update', list.formatList());
    });
    socket.on('spoke', function(id){
        var speaker = getUser(socket.id, id);
        var list = getSpeakerList();
        list.speakerSpoke(speaker);
        io.emit('speaker list update', list.formatList());
    });
    socket.on('motion', function(data){
        var sl = getSpeakerList();
        try{
            if(sl && sl.list && sl.list[0].id === socket.id){
                motion = new Motion(data.motionText, getUser(socket.id, data.id), null);
                io.emit('awaiting second', motion);
            }
        }
        catch(ex){}
    });
    socket.on('motion seconded', function(id){
        if(socket.id !== motion.author.id) {
            motion.second = getUser(socket.id, id);
            var motionSpeakers = new SpeakerList();
            speakerLists.push(motionSpeakers);
            motionSpeakers.addSpeaker(motion.author);
            motionSpeakers.addSpeaker(motion.second);
            resetSpeakCount();
            io.emit('speaker list update', motionSpeakers);
            //TODO
            io.emit('motion on floor', motion.motionText);
        }
    });
    socket.on('disconnect', function () {
        console.log('disconnect');
        signOut(socket.id);
        io.emit('chat message', 'A user has disconnected');
    });
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

http.listen(3000, '0.0.0.0', function () {
    console.log('listening on 3000');
});

function signIn(socket, data){
    var user = {
        name: data.name,
        userId: data.id,
        id: socket.id,
        idSet: false,
        speakCount: 0
    };
    users.push(user);
}

function getUser(socketId, userId){
    for(var user in users){
        if(users[user].id === socketId){
            return users[user];
        }
        else if (users[user].userId === userId && users[user].idSet === false){
            users[user].id = socketId;
            users[user].idSet = true;
            return users[ user ];
        }
    }
}

function getSpeakerList(){
    if(speakerLists.length){
        return speakerLists[speakerLists.length - 1];
    }

}

function resetSpeakCount(){
    if(users.length) {
        for (var index in users) {
            users[index].speakCount = 0;
        }
    }
}

function signOut(id){
    for(var user in users){
        if(users[user] === id){
            users.splice(user, 1);
        }
    }
}

/**
 * TODO:
 *
 * Alter speaker list modification to use the last speaker list in the stack
 *
 * Finish socket.on('motion')
 *
 * Add socket.on('amendment')
 *
 * Allow for seconds
 *
 * Allow for rescinding motions
 *
 * Allow for voting on a motion/amendment
 *
 * Create config file to keep track of quorum/minutes file location
 *
 * Minutes --> log file formatted intelligently
 *
 */

module.exports = app;
