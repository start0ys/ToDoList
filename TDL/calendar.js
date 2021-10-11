function addJavascript(jsname) {

	var th = document.getElementsByTagName('head')[0];

	var s = document.createElement('script');

	s.setAttribute('type','text/javascript');

	s.setAttribute('src',jsname);

	th.appendChild(s);

}
addJavascript('tdl.js');
var id = 0;
var add = 0;
var del = 0;
var clickDay = "";
let schedules = [];
if(add == 1){
    console.log('h');
    $("#+").attr('class','activeBtn');
}
function plus() { add = 1; del = 0; $("#plusBtn").attr('class','activeBtn'); $("#minusBtn").attr('class','nomalBtn');}
function minus() { del = 1; add = 0; $("#minusBtn").attr('class','activeBtn'); $("#plusBtn").attr('class','nomalBtn');}
function uuid() {
    function s4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
function setschedules(){
    localStorage.setItem('schedule',JSON.stringify(schedules)); //string형식으로 변환해서 local storage에 저장하기
}
function showschedules(data){
    schedules.push(data);
    setschedules();
}

function createCalendar(schedule){
  $('.fc-event-time').remove(); 
  // calendar element 취득
  var calendarEl = $('#calendar')[0];
  // full-calendar 생성하기
  var calendar = new FullCalendar.Calendar(calendarEl, {
    //with: '30%', 
    height: '600px', // calendar 높이 설정
    expandRows: true, // 화면에 맞게 높이 재설정
    slotMinTime: '00:00', // Day 캘린더에서 시작 시간
    slotMaxTime: '24:00', // Day 캘린더에서 종료 시간
    // 해더에 표시할 툴바
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialView: 'dayGridMonth', // 초기 로드 될때 보이는 캘린더 화면(기본 설정: 달)
    // navLinks: true, // 날짜를 선택하면 Day 캘린더나 Week 캘린더로 링크
    editable: true, // 수정 가능?
    selectable: true, // 달력 일자 드래그 설정가능
    nowIndicator: true, // 현재 시간 마크
    dayMaxEvents: true, // 이벤트가 오버되면 높이 제한 (+ 몇 개식으로 표현)
    locale: 'ko', // 한국어 설정
    eventClick:function(event) {
      if(del == 1) { var confirmDel = confirm(event.event.title + " 을 제거 하시겠습니까?"); }
      if(confirmDel){
        calendar.getEventById(event.event.id).remove();
        const clearSchedules = schedules.filter(data =>{
            return data.id !== event.event.id;
        }); 
        schedules = clearSchedules; 
        setschedules();
        $("#minusBtn").attr('class','nomalBtn');
      }
      del = 0;
      $('.fc-event-time').remove();
    },
    events: schedule,
    select: function(arg) { // 캘린더에서 드래그로 이벤트를 생성할 수 있다.
      $('#listTitle').html(todayReturn(arg.start.toString()));
      var day=dayReturn(arg.start.toString());
      //listStart(day);
      if(add == 1) {var title = prompt('일정을 입력해주세요');}
      if (title) {
        const scheduleObj = {
            id: uuid(),
            title: title,
            start: arg.start,
            end: arg.end,
            allDay: arg.allDay
        };
        schedules.push(scheduleObj);
        setschedules();
        $("#plusBtn").attr('class','nomalBtn');
        calendar.addEvent(scheduleObj)
        $('.fc-event-time').remove();
      }
      add = 0;
      calendar.unselect()
    }
    
  });
  // 캘린더 랜더링
  calendar.render();
}

const loadedschedules = localStorage.getItem('schedule'); //localstorange에 저장된 값을 불러오기
const parsedschedules = JSON.parse(loadedschedules); //string방식으로 저장한걸 가져와서 다시 객체형식으로 변환해야한다.
parsedschedules.forEach(function(data){
  schedules.push(data);
  setschedules();
});
createCalendar(parsedschedules);

// function dateClik(){
//   return
// }