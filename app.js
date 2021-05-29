/* socket\app.js */
const express = require("express");
const app = express();
const server = require("http").Server(app);
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
const io = require("socket.io")(server, {
	cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = process.env.PORT || 3001;

// 아이디 저장
var UserID = [];
// 투표결과 저장
var VoteID = [];
// 단어
var wordArr = [
	"라면",
	"물티슈",
	"노트북",
	"후드티",
	"비닐봉지",
	"시계",
	"마우스",
	"의자",
	"다이어리",
	"가방",
];
// 라이어
var liar;

io.on("connection", (socket) => {
	console.log("a user connected");
	// 플레이어 들어올 때 마다 배열에 플레이어 이름 추가 되어 전송
	socket.on("enter", (data) => {
		console.log(socket.id, ":", data.player, "입장");
		//react 내에 nickname 따로 저장해두는거 있음? 

		// UserID 가 겹치면 뒤에 배열 크기 만큼의 번호 붙이기
		if (UserID.includes(data.player) === true) {
			UserID.push(data.player+(UserID.length).toString());
		}
		else { 
			UserID.push(data.player);
		}
		console.log(socket.id, ":", data.player, "입장");
		io.emit("enter", {
			state: "enter",
			player: UserID,
		});
		// uer4명일 때, 게임 시작 
		if (UserID.length === 4) {
			var randomNumber = Math.floor(Math.random() * 10);
			// 라이어 기록하기.
			console.log("game start before. liar is ", liar);
			liar = UserID[randomNumber % 4];
			console.log("game start. liar is ", liar);
			// game set response
			io.emit("gameset", {
				state: "gameset",
				player: UserID,
				liar: liar,
				word: wordArr[randomNumber],
			});
			// TIMEout이 발생하여야 POST로 이어짐.
			setTimeout(() => {
				io.emit("result", {
					state: "result",
					liar: liar,
					picked: voteState,
				});
			}, 120000);
		}
	});

	// 채팅 관련 송신 및 수신
	socket.on("chat", (data) => {
		console.log(data.player, ": ", data.text);
		io.emit("chat", {
			state: "chat",
			player: data.player,
			text: data.text,
		});
	});

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

let votecnt = 0;
let voteState = [];
let voteToLiar = 0;

app.post("/", (req, res) => {
	votecnt += 1;
	/*
	 * post body : { nickname : 보낸사람, vote : 누구에게 투표했는지 }
	 * ex) {"문상혁" : "윤두현"}
	 */
	try {
		if (req.body.vote === liar) {
			voteToLiar++;
			console.log(voteToLiar);
		}
		voteState.push(req.body);
		console.log(voteState);
	} catch (e) {
		console.log(e);
	}
	// 그냥 형식적으로 보내주는 리스폰스
	// 전부 소켓으로 하면 편하긴 한데 패킷 종류를 여러개로 해야되니까 어거지로 넣음..
	res.send({ result: liar });
	if (votecnt === 3){
		io.emit("end", {
			state: "end",
			liar: liar,
			picked: voteState,
		});
	// 게임 종료 후 사용자 ID 배열 및 liar 초기화.
		UserID = [];
		liar = null;
		voteState = [];
		votecnt = 0;
		voteToLiar = 0;
	}
	
});
server.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
