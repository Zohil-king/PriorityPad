const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const dueDate = document.getElementById("due-date");
const priority = document.getElementById("priority");
const category = document.getElementById("category");
const themeSwitch = document.getElementById("theme-switch");
const exportBtn = document.getElementById("export-btn");

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});
themeSwitch.addEventListener("change", toggleTheme);
exportBtn.addEventListener("click", exportTasks);

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

// Load theme on page load
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeSwitch.checked = true;
}

// Add task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return alert("Enter a task.");

  const task = {
    text,
    date: dueDate.value,
    priority: priority.value,
    category: category.value,
    completed: false
  };

  renderTask(task);
  saveTask(task);

  if (task.date) scheduleNotification(task);

  taskInput.value = "";
  dueDate.value = "";
  priority.value = "";
  category.value = "";
}

// Render task
function renderTask(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  if (task.completed) li.classList.add("completed");

  const header = document.createElement("div");
  header.className = "task-item-header";

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;
  text.addEventListener("click", () => {
    li.classList.toggle("completed");
    task.completed = !task.completed;
    updateStorage();
  });

  const del = document.createElement("button");
  del.className = "delete-btn";
  del.textContent = "Delete";
  del.addEventListener("click", () => {
    li.remove();
    removeTask(task);
  });

  header.appendChild(text);
  header.appendChild(del);
  li.appendChild(header);

  const meta = document.createElement("div");
  meta.className = "task-meta";
  meta.textContent = [
    task.date ? `📅 ${task.date}` : '',
    task.priority ? `⭐ ${task.priority}` : '',
    task.category ? `🏷️ ${task.category}` : ''
  ].filter(Boolean).join(" | ");
  if (meta.textContent) li.appendChild(meta);

  taskList.appendChild(li);
}

// Local Storage
function saveTask(task) {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateStorage() {
  const items = [];
  taskList.querySelectorAll(".task-item").forEach(li => {
    const text = li.querySelector(".task-text").textContent;
    const meta = li.querySelector(".task-meta")?.textContent || "";
    const completed = li.classList.contains("completed");

    const task = {
      text,
      date: meta.match(/📅 (\d{4}-\d{2}-\d{2})/)?.[1] || '',
      priority: meta.match(/⭐ (\w+)/)?.[1] || '',
      category: meta.match(/🏷️ (\w+)/)?.[1] || '',
      completed
    };
    items.push(task);
  });
  localStorage.setItem("tasks", JSON.stringify(items));
}

function removeTask(taskToRemove) {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks = tasks.filter(t => t.text !== taskToRemove.text || t.date !== taskToRemove.date);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load existing tasks
window.addEventListener("DOMContentLoaded", () => {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks.forEach(renderTask);
});

// Export as JSON
function exportTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "todo-tasks.json";
  link.click();
}

// Notification reminder
function scheduleNotification(task) {
  if (!("Notification" in window)) return;

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      const now = new Date();
      const taskTime = new Date(task.date + "T09:00:00");

      const delay = taskTime.getTime() - now.getTime();
      if (delay > 0 && delay < 86400000) {
        setTimeout(() => {
          new Notification("Reminder", {
            body: `Task due today: ${task.text}`,
            icon: "https://cdn-icons-png.flaticon.com/512/4436/4436481.png"
          });
        }, delay);
      }
    }
  });
}
