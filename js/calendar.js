let privateKey, todoDB, calendarDB,
    maxTodoSeq = 0, maxFinishSeq = 0,
    schedules = [], todoCheckObj = {};
//  Fire Base 사용 여부
const isFirebaseAvailable = typeof FIREBASE_CONFIG !== undefined && !!FIREBASE_CONFIG && !$.isEmptyObject(FIREBASE_CONFIG);
const mode = new URLSearchParams(location.search).get('mode') || '';

/**
 * 한 자리수의 시간 앞에 '0' 추가
 * @param {number} time : 시간
 * @returns 
 */
const getTimeNumber = time => time < 10 ? '0' + time : time;

/**
 * 랜덤 번호 return
 * @returns 
 */
const uuid = () => {
    const s4 = () => ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

/**
 * Todo 태그
 * @param {String} id : ToDo ID
 * @param {String} text : text - 기본값 ''
 * @param {Boolean} isDel : true-Finish, false-Todo - 기본값 false
 * @param {String} seq : 순서
 */
const getTodoTagStr = (id, text='', isDel=false, seq) => `<span class="mr8 cp">${text}</span><span class="${isDel ?  'finish' : 'todo'} cp" todo-id="${id}" todo-text="${text}" todo-seq="${seq}"><i class="fas ${isDel ?  'fa-times' : 'fa-check'} stroke"></i></span>`;


$(() => {
    //* TODO test
    if(mode === '01') $('#calendar').addClass('view-mode');
    setTopDate();
    setInterval(clock);
    setPrivateKey();
    createCalendar();
    setFireBase();
    setScheduleList();
    setDayByTodoList();
    setTodoList();
    setTodoCheckObj();
    eventBind();
});

/**
 * privateKey 세팅 - local storage에서 관리
 */
function setPrivateKey(){
  privateKey = localStorage.getItem('todoPrivateKey');
  if(privateKey == null) {
    privateKey = uuid();
    localStorage.setItem('todoPrivateKey', privateKey);
  }
}

/**
 * fireBase DB 세팅
 */
function setFireBase(){
  if(!isFirebaseAvailable) return;
  firebase.initializeApp(FIREBASE_CONFIG);
  const db = firebase.firestore();

  todoDB = db.collection('todo');
  calendarDB = db.collection('calendar');

}

/**
 * 이벤트 세팅
 */
function eventBind() {
  $(document).on('keyup', '#todoInput', function(e) {
    if (e.keyCode !== 13) return;
    let text = $(this).val();
    let id = uuid();
    ++maxTodoSeq;
    SaveTodo.insert(id, text);
    setTodo(id, text, false, maxTodoSeq);
    $(this).val('');
  });

  $(document).on('click', '.todo', function(e) {
    e.stopPropagation();
    let id =  $(this).attr('todo-id');
    let text =  $(this).attr('todo-text');
    ++maxFinishSeq
    SaveTodo.update(id, '03');
    $(`#${id}`).remove();
    setTodo(id, text, true, maxFinishSeq);
  });

  $(document).on('click', '.finish', function(e) {
    e.stopPropagation();
    let id =  $(this).attr('todo-id');
    $(`#${id}`).remove();
    SaveTodo.delete(id);
  });

  $(document).on('dblclick', '.checkList', function() { 
    const targetSpan = $(this).find('span:last');
    const $input = $('<input/>', {
                    'class': 'temporary-input',
                    'todo-class': targetSpan.hasClass('finish') ? 'finish' : 'todo',
                    'todo-id': targetSpan.attr('todo-id'),
                    'todo-seq': targetSpan.attr('todo-seq')
                });
    $(this).empty();
    $(this).append($input);
    $input.focus().val(targetSpan.attr('todo-text'));
  });

  $(document).on('blur keyup', '.temporary-input', function(e) {
      if(e.type === 'keyup' && e.keyCode !== 13) return;
      const $target = $(this).closest('.checkList');
      const id = $(this).attr('todo-id'),
          text = $(this).val(),
          isDel = $(this).attr('todo-class') === 'finish',
          seq = $(this).attr('todo-seq');
      $target.empty();
      $target.append(getTodoTagStr(id, text, isDel, seq));
      SaveTodo.update(id, '01', text);
  });

   $(`#todolist, #finishlist`).sortable({
      stop: function (event, ui) {
        var sortNum = ui.item.find('span:last').attr('todo-seq');
        sortNum = Number(sortNum);
        var type = $(this).attr('id');
        $(`#${type} .checkList`).each(function () {
          const $target = $(this).find('span:last');
          const id = $target.attr('todo-id');
          $target.attr('todo-seq', sortNum);
          SaveTodo.update(id, '02', sortNum);
          if(type === 'todolist') maxTodoSeq = sortNum++;
          else maxFinishSeq = sortNum++;
        });
      }
  });

  $(document).on('click', '.default-color', function() {
    const color = $(this).attr('default-color');
    $('#event-color').val(color);
  });


  $(document).on('keyup', function (e) {  
    if (e.keyCode === 27 && $('#modal-area').hasClass('active')) {
      modalClose();
    }
  });
  
  $(document).on('click', '#modal-close', modalClose);
}

/**
 *  날짜 세팅
 */
function setTopDate() {
  const now = new Date();
  const day = { 0 : '일요일' ,1: '월요일' ,2: '화요일' ,3: '수요일' ,4: '목요일' ,5: '금요일' ,6: '토요일' };

  $('#date').text(`${now.getFullYear()}년 ${getTimeNumber(now.getMonth() + 1)}월 ${getTimeNumber(now.getDate())}일 ${day[now.getDay()]}`);
}


/**
 * 시간 및 날짜 세팅
 */
function clock() {
    const now = new Date();
    const timeStr = `${getTimeNumber(now.getHours())}:${getTimeNumber(now.getMinutes())}:${getTimeNumber(now.getSeconds())}`;

    $('#clock').text(timeStr);
    // 자정이 지나면 날짜 다시 세팅
    if(timeStr === '00:00:00') setTopDate();
}

/**
 * ToDoList가 존재하는 날짜에 빨간 점 표시
 * @param {String} pDate : 날짜 (yy-mm-dd)
 */
function calendarTodoCheck(pDate) {
  let date = pDate || '';
  if(!date) {
    let now = new Date();
    date = `${now.getFullYear()}-${now.getMonth() + 1}`;
  }

  let todoList = Object.keys(todoCheckObj)?.filter(day => day.indexOf(date) > -1);

  for(let todoDay of todoList) {
    setCheckPoint(todoDay);
  }
  
}

/**
 * ToDoList의 날짜 세팅 - 딜력에서 누른 날짜
 * @param {String} day : 날짜 (yyyy년 mm월 dd일)
 */
function setDayByTodoList(day) {
  let now;
  if(!!day) {
    now = new Date(day);
  } else {
    now = new Date();
  }
  $('#todoDayStr').text(`${now.getFullYear()}년 ${getTimeNumber(now.getMonth() + 1)}월 ${getTimeNumber(now.getDate())}일`);
  $('#todoDay').val(`${now.getFullYear()}-${getTimeNumber(now.getMonth() + 1)}-${getTimeNumber(now.getDate())}`);
}



/**
 *  날짜에 따라 Todo List 세팅
 */
function setTodoList() {
  if(!isFirebaseAvailable || !privateKey) return;
  let day = $('#todoDay').val();

  $('#finishlist').empty();
  $('#todolist').empty();

  maxTodoSeq = maxFinishSeq = 0;

  todoDB.where('day', '==', day).where('owner', '==', privateKey).orderBy('seq').get()
    .then((doc) => {
      doc.forEach((item) =>{
        let id = item.id;
        let data = !!item.data() ? item.data() : {};
        let text = data.text || '';
        let isDel = data.del || false;
        let seq = !!data.seq ? Number(data.seq) : 0;

        if(!isDel && seq > maxTodoSeq) maxTodoSeq = seq;
        else if(isDel && seq > maxFinishSeq) maxFinishSeq = seq;

        setTodo(id, text, isDel, seq);
        
      });
  });

}


/**
 * Todo 세팅
 * @param {String} id : ToDo ID
 * @param {String} text : text - 기본값 ''
 * @param {Boolean} isDel : true-Finish, false-Todo - 기본값 false
 * @param {String} seq : Todo Seq
 * @returns 
 */
function setTodo(id, text = '', isDel = false, seq) {
  if(!id) return;

  let $target = isDel ?  $('#finishlist') : $('#todolist');

  $target.append(`<div id="${id}" class="checkList">${getTodoTagStr(id, text, isDel, seq)}</div>`);
}

/**
 *  todoCheckObj 세팅
 */
function setTodoCheckObj() {
  if(!isFirebaseAvailable || !privateKey) return;

  todoDB.where('owner', '==', privateKey).get()
    .then((doc) => {
      doc.forEach((item) =>{
        let data = !!item.data() ? item.data() : {};
        let day = data.day || '';
        if(!!day) {
          if(!data.id) data.id = item.id;
          let todoChekList = todoCheckObj[day] || [];
          todoChekList.push(data);
          todoCheckObj[day] = todoChekList;
          setCheckPoint(day);
        }
        
      });
  });

}

/**
 * Todo가 존재하는 날짜 중 전부 완료했으면 초록색 아니면 빨간색 점 표시
 * @param {String} day 
 */
function setCheckPoint(day) {
  if(!day || !todoCheckObj[day] || todoCheckObj[day].length == 0) return;

  let todoChekList = todoCheckObj[day];
  let delList = todoChekList.map(data => data.del);
  let $target = $(`td[data-date='${day}']`);
  if($.inArray(false, delList) == -1){
    setClass('finish');
  } else {
    setClass('todo');
  }

  /**
   * class setting
   * @param {String} target : 'finish' or 'todo'
   */
  function setClass(target) {
    let remove = target == 'finish' ? 'todoList' : 'finishList';
    let add = target == 'finish' ? 'finishList' : 'todoList';
    if($target.hasClass(remove)) $target.removeClass(remove);
    if(!$target.hasClass(add)) $target.addClass(add);
  }
}


/**
 *  schedules 세팅
 */
async function setScheduleList() {
  if(!isFirebaseAvailable || !privateKey) return;

  await calendarDB.where('owner', '==', privateKey).get()
    .then((doc) => {
      doc.forEach((item) =>{
        let data = !!item.data() ? item.data() : {};
        let scheduleStr = data.schedules || '';
        schedules = JSON.parse(scheduleStr); 
      });
  });

  createCalendar();

}

/**
 * calendar 세팅
 * @param {Array} schedule - 저장된 스케줄
 */
function createCalendar(){
  let addData = null;

  let toDolocation = document.querySelector('#todoDayStr').offsetTop;
  const $modal = $('#modal-area'),
        $body  = $('body');


  /**
   * 배경색에 따라 text colr 흰색 or 검정색 return
   * @param {String} color 
   * @returns 
   */
  const textColor = (color) => {
    if(!color) return '#fff';
    let hexColor = ''
    if(color.substring(0,1) == '#'){
       hexColor = color.substring(1);      // 색상 앞의 # 제거
    }else {
       if (color.search("rgb") == -1 )  return '#fff';
       color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
         function hex(x) {
              return ("0" + parseInt(x).toString(16)).slice(-2);
         }
         hexColor = hex(color[1]) + hex(color[2]) + hex(color[3]); 
    }
     
     const rgb = parseInt(hexColor, 16);   // rrggbb를 10진수로 변환
     const r = (rgb >> 16) & 0xff;  // red 추출
     const g = (rgb >>  8) & 0xff;  // green 추출
     const b = (rgb >>  0) & 0xff;  // blue 추출
     const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
     // 색상 선택
     return luma < 170.5 ? "#fff" : "#302c2c";
 };



  // calendar element 취득
  const calendarEl = $('#calendar')[0]

  const headerToolbar = mode === '01' ? {
    left: 'title',
    right: 'today'
  } : {
    left: 'add key',
    center: 'title',
    right: 'today prev,next'
  };

  // full-calendar 생성하기
  const calendar = new FullCalendar.Calendar(calendarEl, {
    height: 'calc(100% - 25px)', // calendar 높이 설정
    expandRows: true, // 화면에 맞게 높이 재설정
    slotMinTime: '00:00', // Day 캘린더에서 시작 시간
    slotMaxTime: '24:00', // Day 캘린더에서 종료 시간
    themeSystem: 'bootstrap5',
    googleCalendarApiKey : GOOOGLE_API_KEY,
    customButtons:{
        add:{
            text:'추가',
            click: () => {
              if(addData == null) return;
              $modal.css('display','block');
              $body.css('overflow', 'hidden');
              $modal.addClass('active');
            }
        },
        prev:{ text:'<', click: () => changeMonth('prev') },
        next:{ text:'>', click: () => changeMonth('next') },
        key:{
          text:'PrivateKey',
          click: () => {
            console.log(`privateKey : ${[privateKey]}`);
            let newPrivateKey = prompt(`현재 privateKey는 ${privateKey} 입니다.\n변경을 원하시면 privateKey를 입력해주세요.\nprivateKey는 console에서 복사 가능합니다.`);
            if(newPrivateKey) {
              privateKey = newPrivateKey;
              localStorage.setItem('todoPrivateKey', privateKey);
              location.reload();
            }
          }
        },
        today:{ text:'오늘', click: () => changeMonth('today') }
    },
    headerToolbar: headerToolbar,
    initialView: 'dayGridMonth', // 초기 로드 될때 보이는 캘린더 화면(기본 설정: 달)
    editable: true, // 수정 가능?
    selectable: true, // 달력 일자 드래그 설정가능
    nowIndicator: true, // 현재 시간 마크
    dayMaxEvents: true, // 이벤트가 오버되면 높이 제한 (+ 몇 개식으로 표현)
    longPressDelay: 100,
    locale: 'ko', // 한국어 설정
    windowResize: arg => {
      calendar.setOption('height', 'calc(100% - 25px)');
      toDolocation = document.querySelector('#todoDayStr').offsetTop;
    },
    eventClick: event => {
      event.jsEvent.stopPropagation();
      event.jsEvent.preventDefault();
      if($(event.el).hasClass('holiday')) return;
      addData = event.event;
      $('#event-content').val(addData.title);
      $('#event-color').val(addData.backgroundColor);
      $('#empty-area').removeClass('hide').addClass('show');
      $('#modal-delete').removeClass('hide').addClass('show');
      $modal.css('display','block');
      $body.css('overflow', 'hidden');
      $modal.addClass('active');

    },
    events: schedules,
    eventSources : [
      {
        googleCalendarId : 'ko.south_korea#holiday@group.v.calendar.google.com', 
        className : 'holiday', 
        color : 'transparent', 
        textColor : '#FF0000'
      }
    ],
    select: arg => { // 캘린더에서 드래그로 이벤트를 생성할 수 있다.
      addData = arg;
      setDayByTodoList(arg.startStr);
      setTodoList();
      // 모바일인 경우 Todo가 밑에 있기때문에 날짜 클릭 씨 Todo쪽으로 Scroll
      window.scrollTo({ top: toDolocation, behavior: 'smooth'});
    },
    eventDrop: arg => {
      const event = arg.event;
      if(!confirm(`${event.title} 을 이동하시겠습니까?`)) return;
      const targetData = schedules.filter(x=> x.id == event.id)[0] || {};
      if($.isEmptyObject(targetData)) return;
      $.extend(targetData, { start :event.start, end: event.end, allDay: event.allDay} );      
      ScheduleSave.update();
    }
    
  });
  // 캘린더 랜더링
  calendar.render();
  changeMonth('today');

  /**
   * 달력 월 변경
   * @param {String} target : 'next' or 'prev' 
   */
  function changeMonth(target) {
    target == 'next' ? calendar.next() : target == 'prev' ? calendar.prev() : calendar.today();
    const date = calendar.getDate();
    const year = date.getFullYear();
    const month = getTimeNumber(date.getMonth() + 1);
    calendarTodoCheck(`${year}-${month}`);
  }

  /**
   * 모달에서 이벤트 추가
   */
  function addEvent() {
    if(addData == null) return;

    const title = $('#event-content').val();
    const eventColocr = $('#event-color').val();
    if(!!title && !!eventColocr) {
        removeEvent(addData.id);
        const scheduleObj = {
            id: uuid(),
            title: $('#event-content').val(),
            start: addData.start,
            end: addData.end,
            allDay: addData.allDay,
            color : eventColocr,
            textColor: textColor(eventColocr)
        };
          
        calendar.addEvent(scheduleObj);
        schedules.push(scheduleObj);
        ScheduleSave[schedules.length == 1 ? 'insert' : 'update']();
    }

  
    addData == null;
    calendar.unselect();
    modalClose();
  }

  /**
   * 모달에서 이벤트 삭제
   */
  function deleteEvent() {
    if(addData == null) return;

    const title = $('#event-content').val() || '';

    if(confirm(`${title} 을 제거 하시겠습니까?`)){
      removeEvent(addData.id);
      addData == null;
      modalClose();
    }
  }

  /**
   * 이벤트 제거
   * @param {String} eventId 
   */
  function removeEvent(eventId) {
    if(!eventId) return;

    calendar.getEventById(eventId).remove();
    const clearSchedules = schedules.filter(data => data.id !== eventId); 
    schedules = clearSchedules; 
    ScheduleSave[schedules.length == 0 ? 'delete' : 'insert']();
  }

  $('#modal-confirm').on('click', addEvent);
  $('#modal-delete').on('click', deleteEvent);
}

/**
 * Modal Close
 */
function modalClose() {
  $('#modal-area').css('display','none').removeClass('active');
  $('body').css('overflow', 'auto');
  $('#event-content').val('');
  $('#event-color').val('#3788d8');
  $('#empty-area').removeClass('show').addClass('hide');
  $('#modal-delete').removeClass('show').addClass('hide');
}

/**
 * ToDo  저장, 수정, 삭제
 */
class SaveTodo {

  static #saveAvailable = id => !isFirebaseAvailable || !privateKey || !id
  static #updateType = {
    '01': (targetData, val) => $.extend(targetData, { text: val }),
    '02': (targetData, val) => $.extend(targetData, { seq: val }),
    '03': (targetData, val) => $.extend(targetData, { del: true, seq: maxFinishSeq })
  };

  static insert(id, text = '') {
    if (this.#saveAvailable(id)) return;
    const day = $('#todoDay').val();
    let data = {
      id: id,
      day: day,
      text: text,
      del: false,
      seq: maxTodoSeq,
      owner: privateKey
    };
    todoDB.doc(id).set(data);
    let todoCheckList = todoCheckObj[day] || [];
    todoCheckList.push(data);
    todoCheckObj[day] = todoCheckList;
    setCheckPoint(day);
  }

  /**
   * @param {String} id
   * @param {"01" | "02" | "03"} type  01: text, 02: seq, 03: del
   * @param {String} value
   */
  static update(id, type, val = '') {
    if (this.#saveAvailable(id)) return;
    const day = $('#todoDay').val();
    let targetData = todoCheckObj[day]?.filter(data => data.id == id)[0] || {};
    if ($.isEmptyObject(targetData)) return;

    this.#updateType[type](targetData, val);

    todoDB.doc(id).update(targetData);
    setCheckPoint(day);
  }

  static delete(id) {
    if (this.#saveAvailable(id)) return;
    const day = $('#todoDay').val();
    todoDB.doc(id).delete();
    if (!$('.checkList') || $('.checkList').length == 0) {
      delete todoCheckObj[day];
      $(`td[data-date='${day}']`).removeClass('finishList');
    }
  }
}

/**
 *  Calendar 저장, 수정, 삭제
 */
class ScheduleSave {
  
  static #saveAvailable = () => !isFirebaseAvailable || !privateKey

  static insert() {
    if(this.#saveAvailable()) return;
    calendarDB.doc(privateKey).set({
      schedules : JSON.stringify(schedules),
      owner : privateKey
    });
  }

  static update() {
    if(this.#saveAvailable()) return;
    calendarDB.doc(privateKey).update({
      schedules : JSON.stringify(schedules)
    });
  }

  static delete() {
    if(this.#saveAvailable()) return;
    calendarDB.doc(privateKey).delete();
  }
}