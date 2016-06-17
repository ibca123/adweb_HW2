var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(8080);
console.log('Running at port 8080...');


app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/js', express.static(__dirname + '/client/build/js'));
app.use('/css', express.static(__dirname + '/client/build/css'));
app.use('/lib', express.static(__dirname + '/client/build/lib'));
app.use('/image', express.static(__dirname + '/client/build/image'));
app.use('/model', express.static(__dirname + '/client/build/model'));

var clientsum = 10;
var online = new Array(clientsum);
for(var i = 0; i < clientsum; i++)
	online[i] = 0;


function GetID(){
	for(var i = 0; i < clientsum; i++)
		if(online[i] == 0){
			online[i] = 1;
			return i;
		}
}


io.sockets.on('connection', function(socket) {
    // 收到玩家位置信息
    socket.on('onPositionChange', function(data) {
    	console.log(data);
    	socket.broadcast.emit('OnPlayerPositionChange',data);
    });
    console.log('New player connecting in');
    var newid = GetID();
    socket.emit('SetPlayerNO',newid);
    socket.emit('SetOtherPlayers', online);
    socket.broadcast.emit('NewPlayerIn',newid);
    // 玩家离线
    socket.on('disconnect', function(){
        console.log('Player '+newid + ' disconnected');
        socket.broadcast.emit('PlayerOut', newid);
        online[newid] = 0;
    });
    // 收到消息
    socket.on('OnSendMsg', function(data){
        socket.broadcast.emit('OnReceiveMsg', data);
    });
});
