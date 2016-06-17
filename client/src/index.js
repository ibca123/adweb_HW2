var io = require("socket.io-client");

var id = -1;
var onlinesum = 0;

var socket = io.connect('http://localhost:8080');
socket.on('connect', function() {
    console.log("connect success");
    // 设置玩家id
    socket.on('SetPlayerNO', function(data) {
        id = data;
        SetMyID("你的ID："+id);
        onlinesum = 1;
        SetOnlineSum(onlinesum);
    });
    // 设置其他玩家
    socket.on('SetOtherPlayers', function(data) {
        for (var i = 0; i < 20; i++) {
            if (data[i] == 1 && i != id) {
                AddNewPlayer(i);
                onlinesum++;
                SetOnlineSum(onlinesum);
            }
        }
    });
    // 新玩家加入
    socket.on('NewPlayerIn', function(data) {
        console.log('Player ' + data + " connect in");
        AddNewPlayer(data);
        onlinesum++;
        SetOnlineSum(onlinesum);
        AddMsg('Player ' + data + " connect in");
    });
    // 玩家位置改变
    socket.on('OnPlayerPositionChange', function(data) {
        obj = JSON.parse(data);
        OnPlayerPositionChange(obj.id, obj.position, obj.lookat);
    });
    // 玩家退出
    socket.on('PlayerOut', function(data) {
        console.log('Player ' + data + ' disconnected');
        DeletePlayer(data);
        onlinesum--;
        SetOnlineSum(onlinesum);
        AddMsg('Player ' + data + ' disconnected');
    });
    // 收到信息
    socket.on('OnReceiveMsg', function(data){
        obj = JSON.parse(data);
        AddMsg('Player ' + obj.id + ':'+obj.msg);
    });
    setInterval(OnPositionChange, 100);

    // 设置按钮
    var btInput = document.getElementById('btInput');
    btInput.addEventListener("click",
    function(){
        var input = document.getElementById('input');
        var msg = input.value;
        input.value = '';
        SendMsg(msg);
    });
});
// 向服务器发送自己位置的变化
function OnPositionChange() {
    var position = {
        'x': eye.elements[0],
        'y': eye.elements[1],
        'z': eye.elements[2]
    };
    var lookat = {
        'x': at.elements[0],
        'y': at.elements[1],
        'z': at.elements[2]
    };
    var msg = {
        'id': id,
        position: position,
        lookat: lookat
    };
    socket.emit('onPositionChange', JSON.stringify(msg));
    //console.log(msg);
}
// 设定当前在线人数
function SetOnlineSum(num){
    var p = document.getElementById('onlinesum');
    p.innerHTML = "当前在线人数："+num;  
}
// 设定ID
function SetMyID(name){
    var p = document.getElementById('myID');
    p.innerHTML = name;
}
// 添加消息
function AddMsg(msg){
    var body = document.getElementById('body');
    body.innerHTML += "<p style = 'width:100%; margin:1px'>"+msg+"</p>"
    body.scrollTop = body.scrollHeight;
}
// 发送信息
function SendMsg(msg){
    var send = {
        'id': id,
        'msg': msg
    };
    socket.emit('OnSendMsg', JSON.stringify(send));
    AddMsg('Player ' + id + ':'+msg);
}
