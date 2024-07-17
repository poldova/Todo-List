import defaultList from "./default.json";

function saveList(newList) {
  localStorage.setItem("list", JSON.stringify(newList));
}

if (localStorage.length === 0)
  localStorage.setItem("list", JSON.stringify(defaultList));

const list = JSON.parse(localStorage.getItem("list"));

function createList(name, color) {
  const newList = {
    name,
    color,
    quantity: 0,
    tasks: [],
  };
  list.push(newList);
  saveList(list);
  return list;
}

function createTask(name, listId, deadline) {
  const newTask = {
    name,
    deadline,
    isPriority: false,
    isComplete: false,
  };
  list[listId].tasks.push(newTask);
  list[listId].quantity += 1;
  saveList(list);
  return list;
}

function isNameValid(taskName, id) {
  if (id === undefined) {
    for (const listID in list) {
      if (list[listID].name === taskName) return "invalid";
    }
  } else {
    let listId = list[id].tasks;
    for (const taskID in listId) {
      if (listId[taskID].name === taskName) return "invalid";
    }
  }
}

function toggleCompleteStatus(listId, taskId) {
  const taskData = list[listId].tasks[taskId];
  taskData.isPriority = !taskData.isPriority;
  taskData.isComplete = !taskData.isComplete;
  saveList(list);
  return list;
}

function togglePriorityStatus(listId, taskId) {
  const taskData = list[listId].tasks[taskId];
  if (taskData.isComplete) {
    taskData.isPriority = false;
  } else {
    taskData.isPriority = !taskData.isPriority;
  }
  saveList(list);
  return list;
}

function deleteList(listId) {
  list.splice(listId, 1);
  saveList(list);
  return list;
}

function deleteTask(listId, taskId) {
  list[listId].tasks.splice(taskId, 1);
  saveList(list);
  return list;
}

function editListNameandColor(name, color, id) {
  list[id].name = name;
  list[id].color = color;
  saveList(list);
}

function editTaskNameandDate(name, date, listId, taskId) {
  list[listId].tasks[taskId].name = name;
  list[listId].tasks[taskId].deadline = date;
  saveList(list);
  return list;
}

function compare(a, b, operator) {
  switch (operator) {
    case "<=":
      return a <= b;
    case ">=":
      return a >= -b;
    default:
      return false;
  }
}
const MS_SECOND = 1000;
const MS_MINUTE = MS_SECOND * 60;
const MS_HOUR = MS_MINUTE * 60;
const MS_DAY = MS_HOUR * 24;
const MS_WEEK = MS_DAY * 7;
const MS_MONTH = MS_DAY * 30;
const MS_YEAR = MS_DAY * 365;
const timeUnits = [
  { limit: MS_MINUTE, divisor: MS_SECOND, unit: "s" },
  { limit: MS_HOUR, divisor: MS_MINUTE, unit: "m" },
  { limit: MS_DAY, divisor: MS_HOUR, unit: "H" },
  { limit: MS_WEEK, divisor: MS_DAY, unit: "D" },
  { limit: MS_MONTH, divisor: MS_WEEK, unit: "W" },
  { limit: MS_YEAR, divisor: MS_MONTH, unit: "M" },
];

function formatDateToUnit(taskData) {
  const taskTime = new Date(taskData.deadline) - new Date();
  const operator = taskTime <= 0 ? ">=" : "<=";

  let calcTime, unit;

  if (compare(taskTime, MS_MINUTE, operator)) {
    calcTime = taskTime / MS_SECOND;
    unit = "s";
  } else if (compare(taskTime, MS_HOUR, operator)) {
    calcTime = taskTime / MS_MINUTE;
    unit = "m";
  } else if (compare(taskTime, MS_DAY, operator)) {
    calcTime = taskTime / MS_HOUR;
    unit = "H";
  } else if (compare(taskTime, MS_WEEK, operator)) {
    calcTime = taskTime / MS_DAY;
    unit = "D";
  } else if (compare(taskTime, MS_MONTH, operator)) {
    calcTime = taskTime / MS_WEEK;
    unit = "W";
  } else if (compare(taskTime, MS_YEAR, operator)) {
    calcTime = taskTime / MS_MONTH;
    unit = "M";
  } else {
    calcTime = taskTime / MS_YEAR;
    unit = "Y";
  }

  if (taskTime < 0) taskData.isPriority = false;
  const fullWord = `${calcTime.toFixed()}${unit}`;
  return { fullWord, taskTime };
}

export {
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
};
