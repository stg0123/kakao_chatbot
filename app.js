
const libKakaoWork = require('./libs/kakaoWork');
const express = require('express');
const router = express.Router();
setInterval(async function(){ 
	// 로직 세우기 
	// todo: 크롤러 호출
	// returned 받고
	// returned가 빈 배열이 아니면 아래 로직 수행
	
	console.log("tick");
	// 유저 목록 검색 (1)
	
	//const returned = []
	const returned = [['글번호','글제목','신청기간','멘토링날짜','접수인원','접수중여부','멘토이름','등록일','https://www.swmaestro.org/sw/mypage/myMain/main.do?menuNo=200026'],
					 ['글번호2','글제목2','신청기간2','멘토링날짜2','접수인원2','접수중여부2','멘토이름2','등록일2','https://www.swmaestro.org/sw/mypage/myMain/main.do?menuNo=200026']];

	if(returned.length==0) return;
	
	const users = await libKakaoWork.getUserList();
	//console.log(users);
	// 검색된 모든 유저에게 각각 채팅방 생성 (2)
	const conversations = await Promise.all(
		users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
	);
	
	// 생성된 채팅방에 메세지 전송 (3)
	// 제목(1), 멘토이름(6), 신청기간(2), 멘토링날짜(3)
	for(var i = 0;i<returned.length;i++){
		const messages = await Promise.all([
		conversations.map((conversation) =>
			libKakaoWork.sendMessage({
				conversationId: conversation.id,
				  text: "새로운 멘토링이 올라왔어요!",
				  blocks: [
					{
					  type: "header",
					  text: "새로운 멘토링이 올라왔어요!",
					  style: "blue"
					},
					{
					  type: "text",
					  text: "멘토 : " + returned[i][6],
					  markdown: true
					},
					{
					  type: "text",
					  text: "제목 : " + returned[i][1],
					  markdown: true
					},
					{
					  type: "description",
					  term: "일시",
					  content: {
						type: "text",
						text: returned[i][3].toString(),
						markdown: false
					  },
					  accent: true
					},
					{
					  type: "button",
					  text: "소마 홈페이지 바로가기",
					  style: "default",
					  action_type: "open_system_browser",
					  value : returned[i][8]
					},
				  ]
			})
		),
	]);
 	console.log(messages);
		
	}
	
}, 60000);

// const express = require('express');
// const path = require('path');

// /* 정혜일 mysql 연결 시도 *//*
// const mysql = require('mysql');
// var connection = mysql.createConnection({
// 	host : 'localhost',
// 	user : 'root'
	
	
// });
// connection.connect();

// connection.query('SELECT 1+1 AS solution', function(error, results, fields){
// 	if (error) throw error;
// 	console.log('Solution : ', result[0].solution);
// })

// connection.end();*/
// /* 정혜일 mysql 연결 시도 */

// const logger = require('morgan');
// const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');

// const index = require('./routes/index');

// const app = express();

// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

// app.use('/', index);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   const err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.json({ err });
// });

// app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'));

// module.exports = app;
