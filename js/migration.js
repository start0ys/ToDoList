/**
 * privateKey 변경
 * @param {String} beforeKey: 기존 Key
 * @param {String} afterKey: 변경 Key
 */
function changePrivateKey(beforeKey, afterKey) {
    changeCalendarPrivateKey(beforeKey, afterKey);
    changeTodoPrivateKey(beforeKey, afterKey);
}

/**
 * Calendar privateKey 변경
 * @param {String} beforeKey: 기존 Key
 * @param {String} afterKey: 변경 Key
 */
async function changeCalendarPrivateKey(beforeKey, afterKey) {
  await calendarDB.where('owner', '==', beforeKey).get()
    .then((doc) => {
      doc.forEach((item) =>{
        let data = !!item.data() ? item.data() : {};
        calendarDB.doc(beforeKey).update({
          schedules : data.schedules,
          owner : afterKey
        });
      });
  });
}


/**
 * TODO privateKey 변경
 * @param {String} beforeKey: 기존 Key
 * @param {String} afterKey: 변경 Key
 */
function changeTodoPrivateKey(beforeKey, afterKey) {
    todoDB.where('owner', '==', beforeKey).get()
    .then((doc) => {
      doc.forEach((item) =>{
        let id = item.id;
        let data = !!item.data() ? item.data() : {};
        data.owner = afterKey;
        todoDB.doc(id).update(data);
        
      });
  });
}