/* socket\app.js */
const express = require('express');
const app = express();
const server = require('http').Server(app);
const cors = require('cors');
app.use(cors())
const io = require('socket.io')(server,{cors: {origin: "*", methods:['GET','POSTT'], credentials: ture}});

const port = process.env.PORT || 5000 ;


// 아이디 저장
var UserID = [];
// 투표결과 저장 
var VoteID = [];

io.on('connection', (socket) => {
  console.log('a user connected');
  // PORT에 socket id 알려주기 
  //io.to(socket.id).emit('my socket id',{socketID, socket.id});  

  // 플레이어 들어올 때 마다 배열에 플레이어 이름 추가 되어 전송?
  socket.on('enter', data => {
    console.log(scoket.id,':',data.player,'입장');
    UserID.push(data.player);
    io.emit('enter',{
      state: 'enter',
      player: UserID,
    });
  });
    
  //게임 시작 세팅 - 제시어 와 random liar 설정 집어 넣어야함.
  socket.on('gameset', () =>{
    // 라이어 랜덤 설정하기
    console.log("game start. liar is ",UserID[1]);
    io.emit('gameset',{
      state : 'gameset',
      player : UserID,
      // 랜덤 설정하기
      liar : UserID[1],
      word : "김해의 아들 마루쉐",
    })

  });

  // 채팅 관련 송신 및 수신
  socket.on('chat', data => {
      console.log(data.name,': ',data.text);
      io.emit('chat',{
        state : 'chat',
        player : data.name,
        text : text
      });
    });

  // vote data
  socket.on('vote', data =>{
    console.log(data.name,' vote to : ',vote);
    VoteID.push({name : vote});
    if(VoteID.length==4){
      io.emit('result',{state : 'result',
        liar : UserID[1], 
        picked : {
          VoteID
          } 
      });}
  });
  
  socket.on('disconnect', () => {
  console.log('user disconnected');
  });
});

server.listen(port, () => { console.log('Listening on port ${port}')});
