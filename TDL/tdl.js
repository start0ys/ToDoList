function listStart(day){    
    const form = document.getElementById("js-todoform"); //form태그 저장
    const todoInput = document.getElementById("js-input");//input 태그 저장
    const todoList = document.getElementById("js-todolist");//ul(목록)태그 저장
    const finishlist = document.getElementById("js-finishlist");

    let todos = []; //localstorage에 값을 넣기 위한 list //재할당받기위해 let으로 변수선언

    function setTodos(){
        localStorage.setItem('memo',JSON.stringify(todos)); //string형식으로 변환해서 local storage에 저장하기
    }

    function deleteTodo(event){
        const btn = event.target; //클릭된 button태그를 반환하여 변수에 저장
        const li = btn.parentNode; //button태그의 부모태그 (li)태그를 변수에 저장
        finishlist.removeChild(li); // todoList(ul)태그에서 자식태그인 (li태그가 저장된) li태그를 제거한다.

        const clearTodos = todos.filter(todo =>{
            return todo.id !== Number(li.id);
        }); 
        //filter란 새로운 배열을 만들어 반환하는 함수이다.todos(localstorage에 저장된 값들)을 filter함수에 todo로 넣는다.
        //todo(localstorage에 저장된 값들)의 id값들과 li(❌버튼을 클릭한 버튼태그의 parentNode(부모태그)인 li태그)의 id값을 비교하여
        //같지않은 값들 즉 ❌버튼을 누른 값 빼고 나머지 값들을 clearTodos라는 변수에 저장한다.
        
        todos = clearTodos; //todos(localstorage에 저장된 값들)변수를 filter로 새로운 배열로 반환해 저장한 clearTodos로 재할당한다.
        setTodos();//setTodos함수를 실행시켜서 재할당된 todos변수를 localstrage에 저장한다.

    }

    function chkTodo(event){
        const btn = event.target; //클릭된 button태그를 반환하여 변수에 저장
        btn.innerText = '❌';
        btn.addEventListener('click',deleteTodo);
        const li = btn.parentNode; //button태그의 부모태그 (li)태그를 변수에 저장
        finishlist.appendChild(li);
        const changeTodos = todos.filter(todo =>{
            if(todo.id == Number(li.id)){
                todo.chk = 1;
            }
            return todo;
        }); 
        todos = changeTodos; //todos(localstorage에 저장된 값들)변수를 filter로 새로운 배열로 반환해 저장한 clearTodos로 재할당한다.
        setTodos();//setTodos함수를 실행시켜서 재할당된 todos변수를 localstrage에 저장한다.

    }

    function todo(data){
        const li = document.createElement("li"); //li태그를 생성
        const span = document.createElement("span"); //span태그를 생성
        span.innerHTML = data; //span태그에 받은 값을 Text로 넣어줌 HTML과 차이점은 HTML은 html요소를 html요소로 사용하는데 Text는 전부 문자로만 반환한다.
        li.appendChild(span);//li태그(부모)아래 span태그(자식)두기
        //<button style="border-width: 0px 0px 0px 27px; border-color: white;;">❌</button> //❌버튼을 border을 통해 text값과 거리를 두기
        const chkbtn = document.createElement("button"); //삭제 버튼만들어주기
        chkbtn.style.borderWidth=0+"px";
        chkbtn.style.borderLeftWidth=27+"px";
        chkbtn.style.borderColor="white";
        chkbtn.style.backgroundColor="white";
        chkbtn.innerText = '✔️';
        chkbtn.addEventListener('click',chkTodo); //❌버튼 클릭하면 deleteTodo함수에 delbtn값을 보내고 함수실행 
        li.appendChild(chkbtn); // li태그 아래 button태그 두기
        const newId = todos.length + 1; // id(index)추가하기 처음에 아무것도 없기떄문에 todos.length는0이다. +1있기때문에 첫번째 입력받은 값의 id는 1 
        li.id = newId //li의 id를 newId로 변경
        todoList.appendChild(li);//todoList(ul)태그아래 li태그 두기
        const todoObj ={
            text:data, //text key에 입력받은 값(value)저장
            id:newId,
            chk:0,
            day:day
        };
        todos.push(todoObj);//text값과 id값을 가진 todoObj을 todos(리스트)에 넣어준다
        setTodos(); //setTodos함수실행
    }

    function finish(data){
        const li = document.createElement("li"); //li태그를 생성
        const span = document.createElement("span"); //span태그를 생성
        span.innerHTML = data; //span태그에 받은 값을 Text로 넣어줌 HTML과 차이점은 HTML은 html요소를 html요소로 사용하는데 Text는 전부 문자로만 반환한다.
        li.appendChild(span);//li태그(부모)아래 span태그(자식)두기
        //<button style="border-width: 0px 0px 0px 27px; border-color: white;;">❌</button> //❌버튼을 border을 통해 text값과 거리를 두기
        const delbtn = document.createElement("button"); //삭제 버튼만들어주기
        delbtn.style.borderWidth=0+"px";
        delbtn.style.borderLeftWidth=27+"px";
        delbtn.style.borderColor="white";
        delbtn.style.backgroundColor="white";
        delbtn.innerText = '❌';
        delbtn.addEventListener('click',deleteTodo); //❌버튼 클릭하면 deleteTodo함수에 delbtn값을 보내고 함수실행 
        li.appendChild(delbtn); // li태그 아래 button태그 두기
        const newId = todos.length + 1; // id(index)추가하기 처음에 아무것도 없기떄문에 todos.length는0이다. +1있기때문에 첫번째 입력받은 값의 id는 1 
        li.id = newId //li의 id를 newId로 변경
        finishlist.appendChild(li);//todoList(ul)태그아래 li태그 두기
        const todoObj ={
            text:data, //text key에 입력받은 값(value)저장
            id:newId,
            chk:1,
            day:day
        };
        todos.push(todoObj);//text값과 id값을 가진 todoObj을 todos(리스트)에 넣어준다
        setTodos(); //setTodos함수실행
    }

    function showTodos(data){
        if(data.chk == 0 && data.day == day){
            todo(data.text);
        }else if(data.chk == 1 && data.day == day){
            finish(data.text);
        }

    }



    function handleSubmit(event){
        event.preventDefault();//submit되었을때 페이지 이동을 막아준다. 즉 새로고침을 막아줌
        const currentValue = todoInput.value; //input창에 작성해서 보낸 값을 변수에 저장
        todo(currentValue);//값을 showTodos함수로보낸다.
        todoInput.value ='';//값을 보내고 나서는 input창 초기화
    }


    function loadTodos(){
        const loadedTodos = localStorage.getItem('memo'); //localstorange에 저장된 값을 불러오기
        if (loadedTodos !== null){ // 저장된게 한개라도 있는경우
            const parsedTodos = JSON.parse(loadedTodos); //string방식으로 저장한걸 가져와서 다시 객체형식으로 변환해야한다.
            parsedTodos.forEach(todo => showTodos(todo));
            // forEach는 arrary객체에서 사용할수있는것으로 for문처럼 반복적인 기능을한다. 여기서는 paredTodos(localstorange에 저장된 값을 arrary객체로 다시 변환하여 가져온값)을
            // todo라는것으로 showTodos함수에 보낸다. 여기서 todo.text 즉 이전에 입력받아서 저장된 text값을 showTodos에 한개씩 반복적으로 보내준다.
            
        }
    }


    function init(){
        loadTodos();//처음에 시작하면 loadTodos함수를 실행
        form.addEventListener('submit',handleSubmit);//form변수=form태그가 저장된곳 즉 form태그에서 submit 이벤트가 발생하면 handleSubmit함수 실행
    }

    init();//함수실행
    console.log(todos);
}
