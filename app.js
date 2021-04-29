
const libKakaoWork = require('./libs/kakaoWork');
const express = require('express');
const crawler = require('./crawling.js');



setInterval(async function(){ 
	// 로직 세우기 
	// todo: 크롤러 호출
	// returned 받고
	// returned가 빈 배열이 아니면 아래 로직 수행

	console.log("tick");
	// 유저 목록 검색 (1)
	
	

	//const returned = []
	//const returned = [['글번호','글제목','신청기간','멘토링날짜','접수인원','접수중여부','멘토이름','등록일','https://www.swmaestro.org/sw/mypage/myMain/main.do?menuNo=200026'],
	//				 ['글번호2','글제목2','신청기간2','멘토링날짜2','접수인원2','접수중여부2','멘토이름2','등록일2','https://www.swmaestro.org/sw/mypage/myMain/main.do?menuNo=200026']];

	var returned = await crawler.startCrawling();
	console.log("crawler result : " + returned + "\n");
	
	if(returned == [] || returned.length==0){
		console.log("There is no NEW data!\n");
		return;
	}
 
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
					  text: "🎈새로운 멘토링이 올라왔어요!🎈",
					  style: "blue"
					},
					{
					  type: "description",
					  term: "멘토",
						content: {
						  type: "text",
						  text: returned[i][6].toString(),
						  markdown: true
						},	
				      accent : true
					},
					{
					  type: "description",
					  term: "제목",
						content: {
						  type: "text",
						  text: returned[i][1].toString(),
						  markdown: true
						},	
				      accent : true
					},
					{
					  type: "description",
					  term: "일시",
						content: {
						  type: "text",
						  text: returned[i][3].toString(),
						  markdown: false
						},	
				      accent : true
					},
					// {
					//   type: "text",
					//   text: "일시 : " + returned[i][3].toString()
					// 	// content: {
					// 	// type: "text",
					// 	// text: returned[i][3].toString(),
					// 	// markdown: false
					// 	// },
					// 	// accent: true
					// },
					{
					  type: "button",
					  text: "멘토링 페이지 바로가기",
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

}, 20000);
// const libKakaoWork = require('./libs/kakaoWork');
// const express = require('express');
// const router = express.Router();
// const crawler = require('./crawling.js');




// setInterval(async function(){ 
// 	// 로직 세우기 
// 	// todo: 크롤러 호출
// 	// returned 받고
// 	// returned가 빈 배열이 아니면 아래 로직 수행
	
// 	console.log("tick");
// 	// 유저 목록 검색 (1)
	
// 	//const returned = []
// 	// 0: 글 no, 1: 글 제목, 2: 신청기간, 3: 멘토링날짜, 4: 접수인원, 5: 접수중여부, 6: 멘토이름, 7: 등록일, 8: 링크
	
	
// 	var returned = await crawler.startCrawling();
// 	console.log("crawler result : " + returned + "\n");
	
// 	//const returned = [['글번호','글제목','신청기간','멘토링날짜','접수인원','접수중여부','멘토이름','등록일','https://www.swmaestro.org/sw/mypage/myMain/main.do?menuNo=200026'],
// 	//				 ['글번호2','글제목2','신청기간2','멘토링날짜2','접수인원2','접수중여부2','멘토이름2','등록일2','https://www.swmaestro.org/sw/mypage/myMain/main.do?menuNo=200026']];

// 	if(returned == [] || returned.length==0) return;
	
	
	
// 	const users = await libKakaoWork.temp_getUserList();
	
	
	
// 	//console.log(users);
// 	// 검색된 모든 유저에게 각각 채팅방 생성 (2)
// 	//for(var i = 0;i<users.length;i++)
// 	const conversations = await Promise.all(
// 		users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
// 	);
	
// 	// 생성된 채팅방에 메세지 전송 (3)
// 	// 제목(1), 멘토이름(6), 신청기간(2), 멘토링날짜(3)
// 	for(var i = 0;i<returned.length;i++){
// 		const messages = await Promise.all([
// 		conversations.map((conversation) =>
// 			libKakaoWork.sendMessage({
// 				conversationId: conversation.id,
// 				  text: "새로운 멘토링이 올라왔어요!",
// 				  blocks: [
// 					{
// 					  type: "header",
// 					  text: "새로운 멘토링이 올라왔어요!",
// 					  style: "blue"
// 					},
// 					{
// 					  type: "text",
// 					  text: "멘토 : " + returned[i][6],
// 					  markdown: true
// 					},
// 					{
// 					  type: "text",
// 					  text: "제목 : " + returned[i][1],
// 					  markdown: true
// 					},
// 					{
// 					  type: "description",
// 					  term: "일시" + returned[i][3].toString(),
// 						// content: {
// 						// type: "text",
// 						// text:  returned[i][3].toString(),
// 						// markdown: false
// 						// },
// 						// accent: true
// 					},
// 					{
// 					  type: "button",
// 					  text: "소마 홈페이지 바로가기",
// 					  style: "default",
// 					  action_type: "open_system_browser",
// 					  value : returned[i][8]
// 					},
// 				  ]
// 			})
// 		),
// 	]);
//  	//console.log(messages);
		
// 	}
	
// }, 10000);
// prev 60000

// const express = require('express');
// const path = require('path');

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
