// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
    const id = nextId;
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return id;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const deadline = dayjs(task.deadline);
    const now = dayjs();
    let cardColor = '';

    if (deadline.isBefore(now)) {
        cardColor = 'bg-danger text-white';
     } else if (deadline.diff(now, 'day') <=3) {
            cardColor = 'bg-warning';
        } 

return `
<div class="card mb-3 ${cardColor}" data-id="${task.id}">
<div class="card-body">
  <h5 class="card-title">${task.title}</h5>
  <p class="card-text">${task.description}</p>
  <p class="card-text"><small>Due: ${task.deadline}</small></p>
  <button class="btn btn-danger delete-task">Delete</button>
</div>
</div>
`;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
$('#todo-cards, #in-progress-cards, #done-cards').empty();

taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    if (task.state === 'Not Yet Started') {
        $('#todo-cards').append(taskCard);
    } else if (task.state === 'In Progress') {
        $('#in-progress-cards').append(taskCard);
    } else if (task.state === 'Done') {
        $('#done-cards').append(taskCard);
    }
});
    $('.card').draggable({
        helper: 'clone',
        revert: 'invalid',
        start: function(event, ui) {
            $(this).hide();
        },
        stop: function(event, ui) {
            $(this).show();
        }
    });
    
    $('.lane .card-body').droppable({
        accept: '.card',
        hoverclass: 'bg-light',
        drop: handleDrop
    });
    attachDeleteHandlers();
}


// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
  
    const title = $('#taskTitle').val();
    const description = $('#taskDescription').val();
    const deadline = $('#taskDeadline').val();
  
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      state: 'Not Yet Started'
    };
  
    taskList.push(newTask);
    saveToLocalStorage();
    renderTaskList();
  
    $('#formModal').modal('hide');
    $('#taskForm')[0].reset();
  }
  

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    const taskId = $(event.target).closest('.card').data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    saveToLocalStorage();
    renderTaskList();
  }


// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.data('id');
    const newStatus = $(this).closest('.lane').attr('id').replace('-cards', '');
  
    taskList = taskList.map(task => {
        if (task.id === taskId) {
            if (newStatus === 'todo') {
              task.state = 'Not Yet Started';
            } else if (newStatus === 'in-progress') {
              task.state = 'In Progress';
            } else if (newStatus === 'done') {
              task.state = 'Done';
            }
          }
      return task;
    });
    saveToLocalStorage();
    renderTaskList();
}
function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
  }
  function attachDeleteHandlers() {
    $('.delete-task').off('click').on('click', handleDeleteTask);
  } 

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#taskForm').on('submit', handleAddTask);
    
    $('#taskDeadline').datepicker({
      dateFormat: 'yy-mm-dd'
    });
});
