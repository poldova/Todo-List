import {
    list,
    createList,
    createTask,
    isNameValid,
    toggleCompleteStatus,
    togglePriorityStatus,
    deleteList,
    deleteTask,
    editListNameandColor,
    editTaskNameandDate,
    formatDateToUnit,
  } from "./logic.js";
  
  const changeList = (function () {
    const $ = (tag) => document.querySelector(tag);
    function $$(tag) {
      return document.querySelectorAll(tag);
    }
    const s = {
      body: $("body"),
      modal: $(".modal"),
      search: $(".search"),
      name: $(".name"),
      list: $(".list"),
      None: $(".None"),
      dueDate: $(".dueDate"),
      content: $(".content"),
      licon: $(".licon"),
      date: $(".date"),
      save: $(".save"),
      container: $(".container"),
      tasks: $(".tasks"),
      menu: $(".menu"),
      color: $('.licon input[name="colors"]:checked'),
      todayCount: $(".select.today .count"),
      importantCount: $(".select.important .count"),
      allCount: $(".select.all .count"),
      incompleteCount: $(".select.incomplete .count"),
    };
  
    function loadList(list) {
      s.tasks.textContent = "";
      for (const listId in list) {
        const data = list[listId];
        const listElement = createList(listId, data);
        s.tasks.appendChild(listElement);
      }
      function createElement(tag, classes = [], id = "", text = "") {
        const element = document.createElement(tag);
        if (classes.length) element.classList.add(...classes);
        if (id) element.id = id;
        if (text) element.textContent = text;
        return element;
      }
  
      function createTask(listId, taskId, data) {
        const label = createElement("label", ["title"]);
        const labelSpan = createElement("span", "", "", data.name);
        const taskElement = createElement(
          "div",
          ["note", "find"],
          `${listId}S${taskId}`,
        );
        const dateDiv = createElement("div", ["date"]);
        const dateUnit = createElement(
          "span",
          ["unit"],
          "",
          formatDateToUnit(data).fullWord,
        );
        const dateTooltip = createElement(
          "span",
          ["tooltip"],
          "",
          `${data.deadline.split("T")[0]} ${data.deadline.split("T")[1]}`,
        );
        dateDiv.append(dateUnit, dateTooltip);
        const checkbox = createElement("input", ["checkbox"]);
        checkbox.type = "checkbox";
        checkbox.name = "checkbox";
        checkbox.checked = data.isComplete;
        const prioritySpan = createElement(
          "span",
          ["priority"],
          `${listId}${taskId}`,
        );
        const openMenu = createElement("div", ["openMenu"], "");
        openMenu.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#898D93" d="M3 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0m7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0m7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0" clip-rule="evenodd"/></svg>`;
        label.append(labelSpan, checkbox);
        taskElement.append(label, openMenu, dateDiv, prioritySpan);
        return taskElement;
      }
  
      function createList(listId, data) {
        const listElement = createElement("div", ["items", "find"], `S${listId}`);
        const headElement = createElement("div", ["head"]);
        const nameElement = createElement(
          "div",
          ["color", data.color || "None"],
          "",
        );
        const titleElement = createElement("span", ["listname"], "", data.name);
        const openMenu = createElement("div", ["openMenu"], "");
        openMenu.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#898D93" d="M3 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0m7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0m7 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0" clip-rule="evenodd"/></svg>`;
        const quantityElement = createElement("span", ["quantity"]);
        nameElement.append(titleElement, quantityElement, openMenu);
        headElement.append(nameElement);
        listElement.appendChild(headElement);
        for (const taskId in data.tasks) {
          const taskData = data.tasks[taskId];
          const taskElement = createTask(listId, taskId, taskData);
          listElement.appendChild(taskElement);
        }
        const addTaskLabel = createElement(
          "div",
          ["newtask"],
          data.name,
          "Add new task",
        );
        listElement.appendChild(addTaskLabel);
        return listElement;
      }
      s.container.appendChild(s.tasks);
      updateStatus(list);
    }
  
    // update
    function updateStatus(list) {
      let allTasks = 0;
      let importantTasks = [];
      let todayTasks = [];
      let incompleteTasks = [];
      let countTasksInList = 0;
      let countDoneTask = 0;
      for (const listId in list) {
        const data = list[listId].tasks;
        countTasksInList = 0;
        countDoneTask = 0;
        for (const taskId in data) {
          const taskData = data[taskId];
          const { taskTime } = formatDateToUnit(taskData);
          const findNote = $(`#\\3${listId}S${taskId}.note.find`);
          const findPriority = $(`#\\3${listId}S${taskId} .priority`);
          allTasks++;
          countTasksInList++;
          if (!taskData.isComplete) {
            incompleteTasks.push(`${listId}S${taskId}`);
            removeClass(findNote, "checked");
            findNote.style.order = 0;
            findNote.removeAttribute("name");
  
            if (taskData.isPriority) {
              importantTasks.push(`${listId}S${taskId}`);
              findNote.style.order = -1;
              addClass(findPriority, "true");
            }
            if (!taskData.isPriority) {
              removeClass(findPriority, "true");
            }
  
            if (taskTime < 86400000 && taskTime > 0) {
              todayTasks.push(`${listId}S${taskId}`);
            }
            if (taskTime < 0) {
              findNote.setAttribute("name", "null");
              findNote.style.order = 1;
            }
          }
          if (taskData.isComplete) {
            countDoneTask++;
            findNote.style.order = 2;
            addClass(findNote, "checked");
            removeClass(findPriority, 'true')
          }
          $(`#S${listId} div .quantity`).textContent =
            `${countDoneTask}/${countTasksInList}`;
        }
      }
  
      s.allCount.textContent = allTasks;
      s.importantCount.textContent = importantTasks.length;
      s.todayCount.textContent = todayTasks.length;
      s.incompleteCount.textContent = incompleteTasks.length;
      return { importantTasks, todayTasks, incompleteTasks };
    }
  
    function addClass(element, className) {
      element.classList.add(className);
    }
  
    function removeClass(element, className) {
      element.classList.remove(className);
    }
  
    function openModal() {
      addClass(s.modal, "active");
      addClass(s.body, "hide");
      s.list.focus();
    }
  
    function closeModal() {
      removeClass(s.modal, "active");
      s.modal.id = "";
      removeClass(s.body, "hide");
      resetForm();
    }
  
    function resetForm() {
      s.list.value = "";
      if (s.None) s.None.checked = true;
      if (s.dueDate) s.dueDate.value = "";
  
      clearSelect();
      hideElements([s.licon, s.date]);
      clearAttributes(s.list, ["name", "id"]);
      resetSaveButton();
    }
  
    function clearSelect() {
      const div = $(".content div");
      if (div) s.content.removeChild(div);
    }
  
    function hideElements(elements) {
      elements.forEach((element) => addClass(element, "none"));
    }
  
    function clearAttributes(element, attributes) {
      attributes.forEach((attr) => element.removeAttribute(attr));
    }
  
    function resetSaveButton() {
      s.save.classList = "save";
    }
  
    function openNewList(listId) {
      if (listId) {
        setTitle("Edit List", changeList);
        s.list.value = list[listId].name;
        s.list.id = listId;
        addClass(s.save, "rList");
        $(`.${list[listId].color}`).checked = true;
      } else {
        setTitle("Create List");
        addClass(s.save, "List");
      }
      removeClass(s.licon, "none");
    }
  
    function openNewTask(listId, taskId) {
      s.modal.id = listId;
      if (taskId === undefined) {
        setTitle("Create Task");
        addClass(s.save, "Task");
      } else {
        setTitle("Edit Task");
        s.list.value = list[listId].tasks[taskId].name;
        s.list.id = `${listId}${taskId}`;
        addClass(s.save, "rTask");
        s.dueDate.value = list[listId].tasks[taskId].deadline;
      }
      removeClass(s.date, "none");
      createSelect(listId);
    }
  
    function setTitle(title) {
      s.name.textContent = title;
    }
  
    function createSelect(listId) {
      const div = document.createElement("div");
      div.textContent = list[listId].name;
      s.content.appendChild(div);
    }
  
    function addNewTask(taskName) {
      const selectedDate = s.dueDate.value;
      const newList = createTask(taskName, s.modal.id, selectedDate);
      loadList(newList);
      closeModal();
    }
  
    function addNewList(listName) {
      const color = $('.licon input[name="colors"]:checked').value;
      let newList = createList(listName, color);
      loadList(newList);
      closeModal();
    }
  
    function editList(listName, listId) {
      const selectesdColor = $('.licon input[name="colors"]:checked').value;
      const newList = editListNameandColor(listName, selectesdColor, listId);
      $(`#S${listId} .listname`).textContent = listName;
      $(`#S${listId} .color`).classList = "color";
      addClass($(`#S${listId} .color`), selectesdColor);
      closeModal();
    }
  
    function editTask(taskName, listId, taskId) {
      const date = s.dueDate.value;
      const newList = editTaskNameandDate(taskName, date, listId, taskId);
      $(`#\\3${listId}S${taskId} .title span`).textContent = taskName;
      $(`#\\3${listId}S${taskId} .date .tooltip`).textContent =
        `${date.split("T")[0]} ${date.split("T")[1]}`;
      $(`#\\3${listId}S${taskId} .date .unit`).textContent = formatDateToUnit(
        list[listId].tasks[taskId],
      ).fullWord;
      console.log();
      updateStatus(newList);
      closeModal();
    }
  
    function toggleCheckBox(listId, taskId) {
      const newList = toggleCompleteStatus(listId, taskId);
      updateStatus(newList);
    }
  
    function togglePriority(listId, taskId) {
      const newList = togglePriorityStatus(listId, taskId);
      updateStatus(newList);
    }
  
    function closeMenu() {
      removeClass(s.menu, "active");
    }
  
    function openMenu(x, y) {
      addClass(s.menu, "active");
      s.menu.style.transform = `translate(${x}px, ${y}px)`;
    }
  
    function deleteTool(listId, taskId) {
      if (listId === "") {
        listId = taskId;
        loadList(deleteList(listId));
      } else {
        loadList(deleteTask(listId, taskId));
      }
    }
  
    function editNote(listId, taskId) {
      if (listId === "") {
        listId = taskId;
        openModal();
        openNewList(listId);
      } else {
        openModal();
        openNewTask(listId, taskId);
      }
    }
  
    function toggleActive(event) {
      const select = document.querySelectorAll(".select");
  
      select.forEach((div) => {
        removeClass(div, "active");
      });
      addClass(event, "active");
    }
  
    function showAll(notes) {
      notes.forEach((note) => removeClass(note, "hide"));
    }
  
    function filterImportantTask(notes, important) {
      showAll(notes);
      notes.forEach((note) => {
        if (!important.includes(note.id)) {
          addClass(note, "hide");
        }
        if (important.length === 0) {
          addClass(note, "hide");
        }
      });
    }
  
    function filterTodayTask(notes, today) {
      showAll(notes);
      notes.forEach((note) => {
        if (!today.includes(note.id)) {
          addClass(note, "hide");
        }
        if (today.length === 0) {
          addClass(note, "hide");
        }
      });
    }
  
    function filterIncompleteTask(notes, incomplete) {
      showAll(notes);
      notes.forEach((note) => {
        if (!incomplete.includes(note.id)) {
          addClass(note, "hide");
        }
        if (incomplete.length === 0) {
          addClass(note, "hide");
        }
      });
    }
  
    document.addEventListener("input", (e) => {
      let target = e.target.classList.value;
      if (target === "list") {
        const inputValue = s.list.value.trim();
        let taskId = $(".modal.find").id || undefined;
        s.list.name = isNameValid(inputValue, taskId);
      } else {
        for (const listId in list) {
          const data = list[listId].tasks;
          for (const taskId in data) {
            if (!data[taskId].name.includes(s.search.value)) {
              addClass($(`#\\3${listId}S${taskId}`), "shide");
            } else {
              removeClass($(`#\\3${listId}S${taskId}`), "shide");
            }
          }
        }
      }
    });
  
    loadList(list);
    s.search.focus();
    let targetId;
    document.addEventListener("click", (e) => {
      let notes = document.querySelectorAll(".note.find");
      let target = e.target.className;
      let listId = e.target.closest(".find").id.split("S");
      let fixedName = s.list.value.trim();
      switch (target) {
        case "newlist":
          targetId = undefined;
          openModal();
          openNewList();
          break;
        case "newtask":
          openModal();
          openNewTask(listId[1]);
          break;
        case "cancel":
          closeModal();
          break;
        case "save Task":
          addNewTask(fixedName);
          break;
        case "save List":
          addNewList(fixedName);
          break;
        case "checkbox":
          toggleCheckBox(listId[0], listId[1]);
          break;
        case "priority true":
        case "priority":
          togglePriority(listId[0], listId[1]);
          break;
        case "openMenu":
          targetId = e.target.closest("div.find").id.split("S");
          openMenu(e.clientX, e.clientY);
          break;
        case "edit":
          editNote(targetId[0], targetId[1]);
          closeMenu();
          break;
        case "delete":
          deleteTool(targetId[0], targetId[1]);
          closeMenu();
          break;
        case "save rList":
          editList(fixedName, targetId[1]);
          break;
        case "save rTask":
          editTask(fixedName, targetId[0], targetId[1]);
          break;
        case "select all":
          toggleActive(e.target);
          showAll(notes);
          break;
        case "select important":
          const { importantTasks } = updateStatus(list);
          toggleActive(e.target);
          filterImportantTask(notes, importantTasks);
          break;
        case "select today":
          const { todayTasks } = updateStatus(list);
          toggleActive(e.target);
          filterTodayTask(notes, todayTasks);
          break;
        case "select incomplete":
          const { incompleteTasks } = updateStatus(list);
          toggleActive(e.target);
          filterIncompleteTask(notes, incompleteTasks);
          break;
        default:
          closeMenu();
          break;
      }
    });
  })();
  
  export { changeList };
  