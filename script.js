/*=====================================
    DOM ELEMENTS
=====================================*/

const taskModal = document.getElementById("taskModal");

const addTaskBtn = document.getElementById("addTaskBtn");

const cancelBtn = document.getElementById("cancelBtn");

const taskForm = document.getElementById("taskForm");

const toast = document.getElementById("toast");

const taskTitle = document.getElementById("taskTitle");

const taskDescription = document.getElementById("taskDescription");

const taskCategory = document.getElementById("taskCategory");

const taskPriority = document.getElementById("taskPriority");

const taskDate = document.getElementById("taskDate");

/*=====================================
    APPLICATION STATE
=====================================*/

let tasks = [];

let editingTaskId = null;

let currentStatusFilter = "all";

let currentCategoryFilter = "all";

let currentSearchTerm = "";

/*=====================================
    MODAL
=====================================*/

function openModal() {

    taskModal.style.display = "flex";

    taskTitle.focus();
    taskModal.setAttribute("aria-hidden","false");

}

function closeModal() {

    editingTaskId = null;

    document.getElementById("modalTitle").textContent = "Add Task";

    taskForm.reset();

    taskModal.style.display = "none";
    taskModal.setAttribute("aria-hidden","true");

}
/*=====================================
    TOAST
=====================================*/

function showToast(message) {

    toast.textContent = message;

    toast.style.opacity = "1";
    toast.style.transform="translateY(0)";

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform="translateY(30px)";

    }, 2500);

}
/*=====================================
    FORM VALIDATION
=====================================*/

function validateForm() {

    if (taskTitle.value.trim() === "") {

        showToast("Please enter a task title.");

        taskTitle.focus();

        return false;

    }

    return true;

}
/*=====================================
    TASK MODEL
=====================================*/

function createTaskObject() {

    return {

        id: Date.now(),

        title: taskTitle.value.trim(),

        description: taskDescription.value.trim(),

        category: taskCategory.value,

        priority: taskPriority.value,

        dueDate: taskDate.value,

        completed: false

    };

}
/*=====================================
    LOCAL STORAGE
=====================================*/

function saveTasks() {

    localStorage.setItem("tasks", JSON.stringify(tasks));

}

function loadTasks() {

    const storedTasks = localStorage.getItem("tasks");

    if (!storedTasks) return;

    tasks = JSON.parse(storedTasks);

}
/*=====================================
    THEME
=====================================*/

function applyTheme(theme) {

    document.body.classList.toggle("dark-mode", theme === "dark");

    const themeButton = document.getElementById("themeToggle");

    themeButton.textContent = theme === "dark" ? "☀️" : "🌙";

}

function toggleTheme() {

    const currentTheme =
        document.body.classList.contains("dark-mode")
            ? "light"
            : "dark";

    applyTheme(currentTheme);

    localStorage.setItem("theme", currentTheme);

}

function loadTheme() {

    const savedTheme = localStorage.getItem("theme") || "light";

    applyTheme(savedTheme);

}
/*=====================================
    RENDER TASKS
=====================================*/

function renderTasks() {

    const taskList = document.getElementById("taskList");

    const emptyState = document.getElementById("emptyState");

    taskList.innerHTML = "";

    let filteredTasks = [...tasks];

    /* Status Filter */

    if (currentStatusFilter === "active") {

        filteredTasks = filteredTasks.filter(task => !task.completed);

    }

    if (currentStatusFilter === "completed") {

        filteredTasks = filteredTasks.filter(task => task.completed);

    }

    /* Category */

    if (currentCategoryFilter !== "all") {

        filteredTasks = filteredTasks.filter(task => task.category === currentCategoryFilter);

    }

    /* Search */

    if (currentSearchTerm) {

        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(currentSearchTerm) ||
            task.description.toLowerCase().includes(currentSearchTerm)
        );

    }

    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        filteredTasks.forEach(task => {

            taskList.appendChild(createTaskCard(task));

        });

    }

    updateStatistics();

}
/*=====================================
    TASK CARD
=====================================*/

function createTaskCard(task) {

    const card = document.createElement("article");

    card.className = "task-card";
    const today = new Date();

    today.setHours(0,0,0,0);

    if (
        task.dueDate &&
        !task.completed &&
        new Date(task.dueDate) < today
    ){

    card.classList.add("overdue");

    }

    if (task.completed) {
        card.classList.add("completed");
    }

    card.dataset.id = task.id;

    card.innerHTML = `

        <div class="task-header">

            <div>

                <h3>${task.title}</h3>

                <p class="task-description">
                    ${task.description || "No description"}
                </p>

            </div>

            <span class="priority ${task.priority.toLowerCase()}">
                ${task.priority}
            </span>

        </div>

        <div class="task-footer">

            <div class="task-meta">

                <span>${task.category}</span>

                <span>${formatDate(task.dueDate)}</span>

            </div>

            <div class="task-actions">

                <button class="complete-btn">
                    ${task.completed ? "Undo" : "Done"}
                </button>

                <button class="edit-btn">
                    Edit
                </button>

                <button class="delete-btn">
                    Delete
                </button>

            </div>

        </div>

    `;

    return card;

}
function formatDate(date) {

    if (!date) return "No Due Date";

    return new Date(date).toLocaleDateString(undefined, {

        day: "numeric",

        month: "short",

        year: "numeric"

    });

}
/*=====================================
    STATISTICS
=====================================*/

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("pendingTasks").textContent = pending;

}
/*=====================================
    EVENTS
=====================================*/

addTaskBtn.addEventListener("click", openModal);

cancelBtn.addEventListener("click", closeModal);
window.addEventListener("click", (event) => {

    if (event.target === taskModal) {

        closeModal();

    }

});

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeModal();

    }

});

taskForm.addEventListener("submit", (event) => {

    event.preventDefault();

    if (!validateForm()) {

        return;

    }

    if (editingTaskId) {

    const task = tasks.find(task => task.id === editingTaskId);

    task.title = taskTitle.value.trim();

    task.description = taskDescription.value.trim();

    task.category = taskCategory.value;

    task.priority = taskPriority.value;

    task.dueDate = taskDate.value;

    editingTaskId = null;

    document.getElementById("modalTitle").textContent = "Add Task";

    showToast("Task updated.");

} else {

    tasks.push(createTaskObject());

    showToast("Task added.");

}

    renderTasks();
    
    saveTasks();

    showToast("Task added successfully.");

    closeModal();

});

document
    .getElementById("searchInput")
    .addEventListener("input", (event) => {

        currentSearchTerm = event.target.value
            .trim()
            .toLowerCase();

        renderTasks();

    });

document
    .getElementById("filterCategory")
    .addEventListener("change", (event) => {

        currentCategoryFilter = event.target.value;

        renderTasks();

    });

document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelector(".filter-btn.active")
                ?.classList.remove("active");

            button.classList.add("active");

            currentStatusFilter = button.dataset.filter;

            renderTasks();

        });

    });

document
    .getElementById("themeToggle")
    .addEventListener("click", toggleTheme);
/*=====================================
    TASK ACTIONS
=====================================*/

document
    .getElementById("taskList")
    .addEventListener("click", handleTaskActions);

function handleTaskActions(event) {

    const card = event.target.closest(".task-card");

    if (!card) return;

    const id = Number(card.dataset.id);

    if (event.target.classList.contains("delete-btn")) {

        deleteTask(id);

    }

    if (event.target.classList.contains("complete-btn")) {

        toggleTask(id);

    }

    if (event.target.classList.contains("edit-btn")) {

        editTask(id);

    }

}

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    renderTasks();

    saveTasks();
    showToast("Task deleted.");

}

function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    task.completed = !task.completed;

    renderTasks();

    showToast(task.completed ? "Task completed." : "Task restored.");

}

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    editingTaskId = id;

    taskTitle.value = task.title;

    taskDescription.value = task.description;

    taskCategory.value = task.category;

    taskPriority.value = task.priority;

    taskDate.value = task.dueDate;

    document.getElementById("modalTitle").textContent = "Edit Task";

    openModal();

}
/*=====================================
    INITIALIZE
=====================================*/

loadTheme();
loadTasks();

renderTasks();