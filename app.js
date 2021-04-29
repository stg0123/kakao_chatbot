const libKakaoWork = require('./libs/kakaoWork');
const express = require('express');
const crawler = require('./crawling.js');

//
var initiate = async function init(){
	var fs = require('fs'); 
	await fs.readFile('first_chat.txt', 'utf8', async function(err, data) {
		
		fs.writeFile('first_chat.txt', 0, 'utf8', function(error){ });
		
		
		// 처음 보내는 메시지라면 전체에게 챗봇 설명 메시지 발송
		if(data != 0){
			const users = await libKakaoWork.getUserList();
			const conversations = await Promise.all(
				users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
			);
			const messages = await Promise.all([
			conversations.map((conversation) =>
				libKakaoWork.sendMessage({
					conversationId: conversation.id,
					text: "🎁멘토링.gg🎁",
					blocks: [
						{
						  type: "header",
						  text: "🎁멘토링.gg🎁(23팀)",
						  style: "blue"
						},
						{
						  type: "text",
						  text: "안녕하세요, 멘토링.gg입니다.",
						  markdown: true
						},
						{
						  type: "text",
						  text: "해당 챗봇은 소프트웨어 마에스트로 연수생들의 멘토링 신청을 돕고자 하는 목적에서 만들어졌습니다.",
						  markdown: true
						},
						{
						  type: "text",
						  text: "새로운 멘토링이 올라올 때마다 멘토링.gg가 알려줄 거에요!",
						  markdown: true
						}
					]
				})			 
			),]);
		}
	});
	
}

initiate();

setInterval(async function(){ 
	// 크롤링 후 빈 배열이라면 아무것도 하지 않음
	var returned = await crawler.startCrawling();
	if(returned == []){
		return;
	}
 
	// 유저 목록 받아온 후 채팅방 생성
	const users = await libKakaoWork.getUserList();
	const conversations = await Promise.all(
		users.map((user) => libKakaoWork.openConversations({ userId: user.id }))
	);

	// 생성된 채팅방에 메세지 전송
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
								markdown: false
							},	
							  accent : true
						},
						{
							type: "description",
							term: "제목",
							content: {
								type: "text",
								text: returned[i][1].toString(),
								markdown: false
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
