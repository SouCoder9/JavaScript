document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todo-input");
  const addTaskButton = document.getElementById("add-task-btn");
  const todoList = document.getElementById("todo-list");

  // Load tasks from localStorage or initialize empty array
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Render existing tasks
  renderAllTasks();

  // Add task on button click
  addTaskButton.addEventListener("click", addTask);

  // Add task on Enter key press
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  function addTask() {
    const taskText = todoInput.value.trim();
    if (taskText === "") {
      // Add visual feedback for empty input
      todoInput.style.borderColor = "var(--danger)";
      setTimeout(() => {
        todoInput.style.borderColor = "transparent";
      }, 1000);
      return;
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks();
    renderTask(newTask);
    todoInput.value = "";
    todoInput.focus();
  }

  function renderAllTasks() {
    // Clear the list first
    todoList.innerHTML = tasks.length === 0 
      ? '<div class="empty-state">No tasks yet. Add one above!</div>' 
      : '';
    
    // Sort tasks: incomplete first, then by creation time
    tasks.sort((a, b) => {
      if (a.completed === b.completed) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return a.completed ? 1 : -1;
    });

    tasks.forEach(renderTask);
  }

  function renderTask(task) {
    if (todoList.querySelector('.empty-state')) {
      todoList.innerHTML = '';
    }

    const li = document.createElement("li");
    li.setAttribute("data-id", task.id);
    
    // Add completed class if task is completed
    if (task.completed) li.classList.add("completed");
    
    li.innerHTML = `
      <div class="checkbox-container">
        <div class="checkbox-custom ${task.completed ? 'checked' : ''}"></div>
      </div>
      <div class="task-text">${task.text}</div>
      <div class="task-actions">
        <button class="delete">×</button>
      </div>
    `;

    // Toggle completion status when clicking the task or checkbox
    const checkbox = li.querySelector('.checkbox-custom');
    const taskText = li.querySelector('.task-text');
    
    [checkbox, taskText].forEach(element => {
      element.addEventListener("click", () => {
        task.completed = !task.completed;
        li.classList.toggle("completed");
        checkbox.classList.toggle("checked");
        saveTasks();
        // Re-sort tasks after completion change
        renderAllTasks();
      });
    });

    // Delete task
    li.querySelector(".delete").addEventListener("click", (e) => {
      e.stopPropagation();
      tasks = tasks.filter((t) => t.id !== task.id);
      li.style.transform = "translateX(100%)";
      li.style.opacity = "0";
      setTimeout(() => {
        li.remove();
        if (tasks.length === 0) {
          todoList.innerHTML = '<div class="empty-state">No tasks yet. Add one above!</div>';
        }
        saveTasks();
      }, 300);
    });

    todoList.appendChild(li);
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
});