// libs/kakaoWork/index.js
const Config = require('config');

const axios = require('axios');
const kakaoInstance = axios.create({
  baseURL: 'https://api.kakaowork.com',
  headers: {
    Authorization: `Bearer ${Config.keys.kakaoWork.bot}`,
  },
});


// ...기본 코드 생략


// 페이징 연습했던것 // 
// 100 개 페이징 조회
// exports.getUserList = async () => {
//   const res = await kakaoInstance.get('/v1/users.list?limit=100'); // 100개 땡기기
//   return res.data; 
// };
// 
// 테스트로 limit 1씩 해서 돌려보기
// cursor 파라미터가 들어갈때 다른 파라미터 들어오면 에러 발생 

// 여기서 수정해서 문제가 된거면 전에 코드로 돌려놓고 다시 돌려보는게 어떠신지



exports.temp_getUserList = async () => {
  const res = await kakaoInstance.get('/v1/users.list');
  return res.data.users;
};



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
	  
	  console.log("\n\tCURRENT USERS : \n" + JSON.stringify(res.data.users));
	  
	  if (cursor == null) break;
  }
  
	
  console.log("\n\tUSER RESULT : \n" + JSON.stringify(users));
	
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