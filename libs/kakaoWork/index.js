// libs/kakaoWork/index.js
const Config = require('config');

const axios = require('axios');
const kakaoInstance = axios.create({
  baseURL: 'https://api.kakaowork.com',
  headers: {
    Authorization: `Bearer ${Config.keys.kakaoWork.bot}`,
  },
});


// 유저 목록 검색 (1)
exports.getUserList = async () => {
  var cursor = null;
  var users = new Array();
  
  while(true) {
	  var res;
	  if(cursor==null) res = await kakaoInstance.get(`/v1/users.list?limit=100`); // cursor=null&limit=1 // corsor=null
	  else res = await kakaoInstance.get(`/v1/users.list?cursor=${cursor}`); // cursor!=null&limit=1 // corsor!=null
	  cursor = res.data.cursor;
	  
	  users = users.concat(res.data.users); // 수정
	  
	  //console.log("\n\tCURRENT USERS : \n" + JSON.stringify(res.data.users));
	  
	  if (cursor == null) break;
  }
  
	
  //console.log("\n\tUSER RESULT : \n" + JSON.stringify(users));
	
  return users;
};

// 채팅방 생성 (2)
exports.openConversations = async ({ userId }) => {
  const data = {
    user_id: userId,
  };
  const res = await kakaoInstance.post('/v1/conversations.open', data);
  return res.data.conversation;
};

// 메시지 전송 (3)
exports.sendMessage = async ({ conversationId, text, blocks }) => {
  const data = {
    conversation_id: conversationId,
    text,
    ...blocks && { blocks },
  };
  const res = await kakaoInstance.post('/v1/messages.send', data);
  return res.data.message;
};