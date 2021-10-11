var clock1 = document.getElementById("clock");
var date1 = document.getElementById("date");
setInterval(function () {
    var now = new Date();
    var clock = now.toString();
    var a = [];
    var b = clock.indexOf("G");
    var e = clock.indexOf(" ");
    var d = clock.indexOf(" " ,e+1);
    var c = clock.indexOf(" " ,d+1);
    var f = clock.indexOf(" " ,c+1);
  

    var year=[];
    for(var i = c; i < f; i++){ year += clock[i]; }
    var date=[];
    for (var i = d; i < c; i++) { date += clock[i]; }
    var month = [];
    for (var i = e + 1; i < d; i++) { month += clock[i]; }
    var day = [];
    for (var i = 0; i < e; i++) { day += clock[i]; }
   

    if (month == 'Jan') { month = '1월'; }
    else if (month == 'Feb') { month = '2월'; }
    else if (month == 'Mar') { month = '3월'; } 
    else if (month == 'Apr') { month = '4월'; } 
    else if (month == 'May') { month = '5월'; } 
    else if (month == 'Jun') { month = '6월'; } 
    else if (month == 'Jul') { month = '7월'; } 
    else if (month == 'Aug') { month = '8월'; } 
    else if (month == 'Sep') { month = '9월'; } 
    else if (month == 'Oct') { month = '10월';} 
    else if (month == 'Nov') { month = '11월';} 
    else if (month == 'Dec') { month = '12월';}
         
    
    if (day == 'Mon') { day = '월요일'; }
    else if (day == 'Tue') { day = '화요일'; }
    else if (day == 'Wed') { day = '수요일'; }
    else if (day == 'Thu') { day = '목요일'; }
    else if (day == 'Fri') { day = '금요일'; }
    else if (day == 'Sat') { day = '토요일'; }
    else if (day == 'Sun') { day = '일요일'; }

    
    for (var i = f; i < b; i++) {
        a += clock[i];
    }

    clock1.innerHTML =  a ;
    date1.innerHTML =  year + "년" + " " + month+date+"일" + " " + day ;
    today1 = year + "년" + " " + month+date+"일";

});

function todayReturn(clock){
    var e = clock.indexOf(" ");
    var d = clock.indexOf(" " ,e+1);
    var c = clock.indexOf(" " ,d+1);
    var f = clock.indexOf(" " ,c+1);
  

    var year=[];
    for(var i = c; i < f; i++){ year += clock[i]; }
    var date=[];
    for (var i = d; i < c; i++) { date += clock[i]; }
    var month = [];
    for (var i = e + 1; i < d; i++) { month += clock[i]; }
    

    if (month == 'Jan') { month = '1월'; }
    else if (month == 'Feb') { month = '2월'; }
    else if (month == 'Mar') { month = '3월'; } 
    else if (month == 'Apr') { month = '4월'; } 
    else if (month == 'May') { month = '5월'; } 
    else if (month == 'Jun') { month = '6월'; } 
    else if (month == 'Jul') { month = '7월'; } 
    else if (month == 'Aug') { month = '8월'; } 
    else if (month == 'Sep') { month = '9월'; } 
    else if (month == 'Oct') { month = '10월';} 
    else if (month == 'Nov') { month = '11월';} 
    else if (month == 'Dec') { month = '12월';}
         
    var today1 = year + "년" + " " + month+date+"일";
    return today1;
}

function dayReturn(clock){
    var a = clock.indexOf(" ");
    var b = clock.indexOf(" " ,a+1);
    var c = clock.indexOf(" " ,b+1);
    var d = clock.indexOf(" " ,c+1);
    var day="";
    for(var i = 0; i < d; i++){ day += clock[i]; }
    return day;
}