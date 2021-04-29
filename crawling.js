var exports = module.exports = {};
var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var chrome = require('selenium-webdriver/chrome');
var user_config = require('./configs/app/swm.js');

// npm install selenium-webdriver 필요

/*
* // 수정자 : 최준성 //
* 
* 기존 코드 수정 사항은 아래와 같습니다.
* 1페이지 하나의 멘토링만 긁어오던 것 -> 1페이지 전체 데이터 긁어오기로 수정 
* 사용자가 링크로 클릭시 바로 해당 페이지로 이동할 수 있도록 링크 제공
* db 대신 txt 파일에 마지막 번호 저장해두고 파일 읽기 쓰기로 수정
*  - 가장 처음으로 실행할 때 반드시 사전에 txt파일을 만들고 멘토링 첫 페이지의 마지막 멘토링 번호를 저장해두고 실행해야 함 (첫 실행에서만 해주면 됩니다.)
*  - txt 파일 이름은 db_num.txt로 설정하였음
* 데이터 업데이트 유무에 따른 정보 반환
*/

/*
04.27 수정자 : 손태균
수정사항

https://help.goorm.io/ko/goormide/18.faq/language-and-environment/selenium-chromewebdriver#chromedriver
구름 문서중 selenium 설치하는 방법에 대한 글을 찾아 재설치 시도해봄
/usr/local/share/chromedriver
이 경로에 chromedriver를옮겨놓게 되어있음 일단 실행은 잘 됨


nodejs의 chromeoption설정방법을 몰라 여기저기 찾아보면서 시도해봄
selenium-webdriver/chrome패키지 chrome변수로 임포트
chrome변수의 options() 객체를 만들어 setoption을통해 headless,npsandbox설정하고
driver 빌드시 chromeoption을 넣어 빌드함

-메모리가 터지는 사태가 발생함 구름 ide에 공유메모리가 부족
->('--disable-dev-shm-usage') 옵션으로 해결
db_num 불러오고 업데이트시 숫자도 출력(불러온 값, 갱신한 값)

 */
// 크롬 설치
// wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
// sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
// sudo apt-get update
// sudo apt-get install google-chrome-stable
// 설치된 크롬 버전 확인코드
// google-chrome --version 



// 함수 리턴값  = 2차원 배열 (분배해야할 값이 없을 시 빈 배열)
// 분배해야할 값이 1개의 멘토링일 경우 >> ls[0]에 정보 배열이 담겨있음 (ex ls[0][0] : 글no ls[0][1] : 글 제목 ... ls[0][8] : 링크)
// 분배해야할 값이 1개초과의 멘토링일 경우 >>> ls[0]부터 분배해야할 멘토링 개수만큼 배열이 들어있음 (최대 10개)		

exports.startCrawling = async function() {    
	try{
		// for debug
		console.log("crawling start\n");

		// 홈페이지를 url을 통해 접속
		var url = "https://www.swmaestro.org/sw/member/user/forLogin.do?menuNo=200025";

		// chrome option 객체생성해서 옵셧셋팅후
		// 드라이버 빌드시 setChromeOptions 을 사용하여 각종 옵션 추가
		var chromeOptions = new chrome.Options();
		chromeOptions.addArguments('--headless'); // display가 없어 꼭 추가해줘야하는옵션 창 없이 동작
		chromeOptions.addArguments('--no-sandbox'); //display가 없어 꼭 추가해줘야하는 옵션
		chromeOptions.addArguments('--disable-dev-shm-usage'); //공유메모리 부족때매 없으면 메모리부족으로 실행이 거의 안됨
		chromeOptions.windowSize({width:1920,height: 1080});

		const driver  = new webdriver.Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();

		// 홈페이지를 url을 통해 접속
		var url = "https://www.swmaestro.org/sw/member/user/forLogin.do?menuNo=200025";
		await driver.get(url);

		// id와 비밀번호 입력 후 로그인버튼 클릭
		let inputId = await driver.findElement(By.id('username'));
		await inputId.sendKeys(user_config.id);
		let inputPw = await driver.findElement(By.id('password'));
		await inputPw.sendKeys(user_config.pw);
		// git에 업로드 시 id, pw 올라가지 않게 gitignore 명시하기.
		const chkLogin = await driver.findElement(By.className('btn5 btn_blue2')); 
		await chkLogin.click();

		//alert창 처리
		(await (await driver).switchTo().alert()).accept();
		// 반응형 페이지이므로 사이즈마다 태그가 다름 maxsize로 설정하여 통일
		// await driver.manage().window().maximize();

		//멘토링 페이지 접근
		url= "https://www.swmaestro.org/sw/mypage/mentoLec/list.do?menuNo=200046";
		await driver.get(url);

		// 첫 페이지 데이터 끌어오기 총 10개의 글이 담겨있음
		let data_list = await driver.findElements(By.xpath('//*[@id="contentsList"]/div/div/div/table/tbody/tr'));



		var ls =[] // 멘토링 전체 데이터 담을 배열
		var idx=0 ; // ls 인덱스
		var key=0; // db_num와 num의 첫 비교시 file 수정을 위한 변수

		var db_num; // db에 저장된 num 받을 변수

		// txt 파일에서 db_num 읽기
		var fs = require('fs'); 
		fs.readFile('db_num.txt', 'utf8', function(err, data) {
			db_num = data;
			console.log("db_num 가져오기 성공 ",data);  // 실제 동작시 주석 처리 하는게 좋을듯?
		});

		for (var i=0; i<10;i++){
			var data = await data_list[i].findElements(By.css('td'));


			// for문 i에 따라 링크가 달라져야 하는데 항상 같은 첫번째 링크로 xpath가 되어있음
			// 이를 data_list[i] 에따라 다른 a태그의 값을 가져오도록 해야함 // 수정 완료 : 수정자 최준성
			var linkText = await data_list[i].findElement(By.css('a')).getAttribute("href"); // 해당 멘토링 링크
			var mentoring_info =[] // 멘토링 정보 담을 배열

			// 멘토링 정보 배열에 담기
			// 0: 글 no, 1: 글 제목, 2: 신청기간, 3: 멘토링날짜, 4: 접수인원, 5: 접수중여부, 6: 멘토이름, 7: 등록일, 8: 링크
			for (var j=0;j<8;j++){
				mentoring_info[j] = await data[j].getText();
			}
			mentoring_info[8] = linkText;

			num = mentoring_info[0]; // 현재 멘토링 번호        

			// num과 db_num이 같아질 때 결과를 담은 ls배열 리턴 
			// (추가적 멘토링이 있을 경우 ls에는 추가적 데이터가 담겨 있을 것이고 추가적 멘토링이 없다면 빈 배열)
			if (db_num == num){
				console.log(ls); //test 용으로 찍어본 로그
				driver.quit(); // 브라우저 종료
				return ls; 
			} 
			// 추가적 멘토링이 있고 첫 비교시 -> 파일의 db_num 수정
			else if(db_num<num && key ==0) {            
				fs.writeFile('db_num.txt', num, 'utf8', function(error){ 
					console.log('db_num 수정 성공',num); // 실제 동작시 주석 처리 하는게 좋을듯?
				});
				ls[idx] = mentoring_info;
				idx++;
				key++;
			}
			// 추가적 멘토링이 있지만 첫 비교가 아닌 경우 -> 파일 수정 X
			else if(db_num<num){
				ls[idx] = mentoring_info;
				idx++;
			}
		}   	
	} catch(error){
		return;
	}
}

//exports.startCrawling();