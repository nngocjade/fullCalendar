scheduleMain();

function scheduleMain() {
  const DEFAULT_OPTION = "Employee";

  let inputElem,
    inputElem2,
    dateInput,
    timeInput,
    addButton,
    sortButton,
    selectElem,
    appointments = [],
    calendar,
    changeBtn,
    apptTable;

  getElements();
  addListeners();
  initCalendar();
  load();
  renderRows(appointments);
  updateSelectOptions();

  function getElements() {
    inputElem = document.getElementsByTagName("input")[0];
    inputElem2 = document.getElementsByTagName("input")[1];
    dateInput = document.getElementById("dateInput");
    timeInput = document.getElementById("timeInput");
    noteInput = document.getElementById("noteInput");
    addButton = document.getElementById("addBtn");
    sortButton = document.getElementById("sortBtn");
    selectElem = document.getElementById("categoryFilter");
    changeBtn = document.getElementById("changeBtn");
    apptTable = document.getElementById("todoTable");
    todoOverlay = document.getElementById("todo-overlay");
  }

  function addListeners() {
    addButton.addEventListener("click", addEntry, false);
    sortButton.addEventListener("click", sortEntry, false);
    selectElem.addEventListener("change", filter, false);
    document.getElementById("todo-modal-close-btn").addEventListener("click", closeEditModalBox);
    window.addEventListener("click", OutsideClickcloseEditModalBox);
    changeBtn.addEventListener("click", commitEdit, false);
  }

  function addEntry(event) {

    let inputValue = inputElem.value;
    inputElem.value = "";

    let inputValue2 = inputElem2.value;
    inputElem2.value = "";

    let dateValue = dateInput.value;
    console.log(dateValue);
    dateInput.value = "";

    let timeValue = timeInput.value;
    console.log(timeValue);
    timeInput.value = "";

    let noteValue = noteInput.value;
    console.log(noteValue);
    noteInput.value = "";

    let obj = {
      id: _uuid(),
      name: inputValue,
      employee: inputValue2,
      date: dateValue,
      time: timeValue,
      note: noteValue
    };

    renderRow(obj);

    appointments.push(obj);

    save();

    updateSelectOptions();

  }

  function updateSelectOptions() {
    let options = [];

    appointments.forEach((obj) => {
      options.push(obj.employee);
    });

    let optionsSet = new Set(options);

    // empty the select options
    selectElem.innerHTML = "";

    let newOptionElem = document.createElement('option');
    newOptionElem.value = DEFAULT_OPTION;
    newOptionElem.innerText = DEFAULT_OPTION;
    selectElem.appendChild(newOptionElem);

    for (let option of optionsSet) {
      let newOptionElem = document.createElement('option');
      newOptionElem.value = option;
      newOptionElem.innerText = option;
      selectElem.appendChild(newOptionElem);
    }

  }

  function save() {
    let stringified = JSON.stringify(appointments);
    localStorage.setItem("appointments", stringified);
  }

  function load() {
    let retrieved = localStorage.getItem("appointments");
    appointments = JSON.parse(retrieved);
    //console.log(typeof appointments)
    if (appointments == null)
      appointments = [];
  }

  function renderRows(arr) {
    arr.forEach(apptObj => {
      renderRow(apptObj);
    })
  }

  function renderRow({ name: inputValue, employee: inputValue2, id, date, time }) {
    // add a new row

    let table = document.getElementById("todoTable");
    let trElem = document.createElement("tr");
    table.appendChild(trElem);

    // date cell
    let dateElem = document.createElement("td");
    dateElem.innerText = date;
    trElem.appendChild(dateElem);

    // time cell
    let timeElem = document.createElement("td");
    timeElem.innerText = time;
    trElem.appendChild(timeElem);

    // name cell
    let tdElem2 = document.createElement("td");
    tdElem2.innerText = inputValue;
    trElem.appendChild(tdElem2);

    // employee cell
    let tdElem3 = document.createElement("td");
    tdElem3.innerText = inputValue2;
    tdElem3.className = "categoryCell";
    trElem.appendChild(tdElem3);

    // edit cell
    let editSpan = document.createElement("span");
    editSpan.innerText = "edit";
    editSpan.className = "material-icons";
    editSpan.addEventListener("click", toEditItem, false);
    editSpan.dataset.id = id;
    let editTd = document.createElement("td");
    editTd.appendChild(editSpan);
    trElem.appendChild(editTd);

    // delete cell
    let spanElem = document.createElement("span");
    spanElem.innerText = "delete";
    spanElem.className = "material-icons";
    spanElem.addEventListener("click", deleteItem, false);
    spanElem.dataset.id = id;
    let tdElem4 = document.createElement("td");
    tdElem4.appendChild(spanElem);
    trElem.appendChild(tdElem4);

    let startTime = date + "T" + time + ":00";

    addEvent({
      id: id,
      title: inputValue,
      start: startTime,
    });

    dateElem.dataset.type = "date";
    dateElem.dataset.value = date;
    timeElem.dataset.type = "time";
    tdElem2.dataset.type = "name";
    tdElem3.dataset.type = "employee";

    dateElem.dataset.id = id;
    timeElem.dataset.id = id;
    tdElem2.dataset.id = id;
    tdElem3.dataset.id = id;

    function deleteItem() {
      trElem.remove();
      updateSelectOptions();

      for (let i = 0; i < appointments.length; i++) {
        if (appointments[i].id == this.dataset.id)
          appointments.splice(i, 1);
      }
      save();

      // remove from calendar
      calendar.getEventById( this.dataset.id ).remove();
    }

  }

  function _uuid() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function sortEntry() {
    appointments.sort((a, b) => {
      let aDate = Date.parse(a.date);
      let bDate = Date.parse(b.date);
      return aDate - bDate;
    });

    save();

    clearTable();

    renderRows(appointments);
  }

  function initCalendar() {
    var calendarEl = document.getElementById('calendar');

    let today = new Date().toISOString().slice(0, 10)

    calendar = new FullCalendar.Calendar(calendarEl, {
    //   editable: true,
      eventStartEditable: true,
      initialView: 'dayGridMonth',
      initialDate: today,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: [],
      eventClick: function(info) {
        toEditItem(info.event);
      },
      eventDrop: function(info) {
        let newDateTime = info.event.start.toISOString();
        let newDate = newDateTime.substr(0,10)
        let newTime = newDateTime.substr(11,5)

        console.log(newDateTime);
        console.log(newDate)
        console.log(newTime)

        // console.log(info.event.title);

        let id = info.event.id
        let index = appointments.findIndex(x => x.id === id)
        console.log(index)
        console.log(appointments[index])

        appointments[index].date = newDate
        appointments[index].time = newTime

        calendar.getEventById( id ).remove();

        appointments.forEach( apptObj => {
          if(apptObj.id == id){
            addEvent({
              id: id,
              title: apptObj.name,
              start: info.event.start.toISOString(),
            });
          }
        });
        save();

        clearTable();

        renderRows(appointments);
    
      },
      eventBackgroundColor: "#a11e12",
      eventBorderColor: "#ed6a5e",
    });

    calendar.render();
  }

  function addEvent(event){
    calendar.addEvent( event );
  }

  function clearTable(){
    // Empty the table, keeping the first row
    let trElems = document.getElementsByTagName("tr");
    for (let i = trElems.length - 1; i > 0; i--) {
      trElems[i].remove();
    }

    calendar.getEvents().forEach(event=>event.remove());
  }

  function filter(){
    clearTable();
    let selection = selectElem.value;

    if (selection == DEFAULT_OPTION) {
        renderRows(appointments);
    } else {
      let filteredCategoryArray = appointments.filter(obj => obj.employee == selection);
        renderRows(filteredCategoryArray);
    }
  }

  function onTableClicked(event){
    if(event.target.matches("td") && event.target.dataset.editable == "true"){
      let tempInputElem;
      switch(event.target.dataset.type){
        case "date" :
          tempInputElem = document.createElement("input");
          tempInputElem.type = "date";
          tempInputElem.value = event.target.dataset.value;
          break;
        case "time" :
          tempInputElem = document.createElement("input");
          tempInputElem.type = "time";
          tempInputElem.value = event.target.innerText;
          break;
        case "name" :
        case "employee" :
          tempInputElem = document.createElement("input");
          tempInputElem.value = event.target.innerText;
          
          break;
        default:
      }
      event.target.innerText = "";
      event.target.appendChild(tempInputElem);

      tempInputElem.addEventListener("change", onChange, false);

    }
      
    function onChange(event){
      let changedValue = event.target.value;
      let id = event.target.parentNode.dataset.id;
      let type = event.target.parentNode.dataset.type;

      // remove from calendar
      calendar.getEventById( id ).remove();

      appointments.forEach( apptObj => {
        if(apptObj.id == id){
          //todoObj.todo = changedValue;
          apptObj[type] = changedValue;
          
          addEvent({
            id: id,
            title: apptObj.name,
            start: apptObj.date + "T" + apptObj.time + ":00",
          });
        }
      });
      save();

      if(type == "date"){
        event.target.parentNode.innerText = formatDate(changedValue);
      }else{
        event.target.parentNode.innerText = changedValue;
      }
        
    }
  }

//   function formatDate(date){
//     let dateObj = new Date(date);
//     let formattedDate = dateObj.toLocaleString("en-US", {
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//     return formattedDate;
//   }

  function showEditModalBox(event){
    // document.getElementById("todo-overlay").classList.add("slidedIntoView");
    todoOverlay.style.display = "flex";
  }

  function closeEditModalBox(event){
    todoOverlay.style.display = "none";
  }

  function OutsideClickcloseEditModalBox(event){
    // document.getElementById("todo-overlay").classList.remove("slidedIntoView");
    if(event.target == todoOverlay){
    todoOverlay.style.display = "none";
  }
    
  }

  function commitEdit(event){
    closeEditModalBox();

    let id = event.target.dataset.id;
    let name = document.getElementById("todo-edit-todo").value;
    let employee = document.getElementById("todo-edit-category").value;
    let date = document.getElementById("todo-edit-date").value;
    let time = document.getElementById("todo-edit-time").value;
    let note = document.getElementById("todo-edit-note").value;

    // remove from calendar
    calendar.getEventById( id ).remove();

    for( let i = 0; i < appointments.length; i++){
      if(appointments[i].id == id){
        appointments[i] = {
          id  : id,
          name : name,
          employee : employee,
          date : date,
          time : time,
          note : note
        };

        addEvent({
          id: id,
          title: appointments[i].name,
          start: appointments[i].date + "T" + appointments[i].time + ":00",
        });
      }
    }

    save();

    // Update the table
    let tdNodeList = apptTable.querySelectorAll("td");
    for(let i = 0; i < tdNodeList.length; i++){
      if(tdNodeList[i].dataset.id == id){
        let type = tdNodeList[i].dataset.type;
        switch(type){
          case "date" :
            tdNodeList[i].innerText = date;
            console.log(date)
            break;
          case "time" :
            tdNodeList[i].innerText = time;
            console.log(time)
            break;
          case "name" :
            tdNodeList[i].innerText = name;
            break;
          case "employee" :
            tdNodeList[i].innerText = employee;
            break;
        }
      }
    }
  }

  function toEditItem(event){
    showEditModalBox();

    let id;

    if(event.target) // mouse event
      id = event.target.dataset.id;
    else // calendar event
      id = event.id;

    preFillEditForm(id);
  }

  function preFillEditForm(id){
    let result = appointments.find(todoObj => todoObj.id == id);
    let {name, employee, date, time, note} = result;
    
    document.getElementById("todo-edit-todo").value = name;
    document.getElementById("todo-edit-category").value = employee;
    document.getElementById("todo-edit-date").value = date;
    document.getElementById("todo-edit-time").value = time;
    document.getElementById("todo-edit-note").value = note;

    changeBtn.dataset.id = id;
  }

}

