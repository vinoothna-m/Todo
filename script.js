/*=====================================================
    TaskFlow - Modern Task Manager
    Author : Madithati Vinoothna
    Version : 2.0
=====================================================*/

"use strict";

/*=====================================================
    DOM ELEMENTS
=====================================================*/

const taskContainer = document.getElementById("taskContainer");
const emptyState = document.getElementById("emptyState");

const taskForm = document.getElementById("taskForm");

const taskModal = document.getElementById("taskModal");
const deleteModal = document.getElementById("deleteModal");

const openTaskModalBtn = document.getElementById("openTaskModal");
const emptyCreateTaskBtn = document.getElementById("emptyCreateTask");

const closeTaskModalBtn = document.getElementById("closeTaskModal");
const cancelTaskBtn = document.getElementById("cancelTask");

const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");

const modalTitle = document.getElementById("modalTitle");

const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskCategoryInput = document.getElementById("taskCategory");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDueDateInput = document.getElementById("taskDueDate");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortTasks");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");

const greetingEl = document.getElementById("greeting");
const currentDateEl = document.getElementById("currentDate");

const toastContainer = document.getElementById("toastContainer");

const themeToggle = document.getElementById("themeToggle");

const tabButtons = document.querySelectorAll(".tab-btn");

const allCount = document.getElementById("allCount");
const activeCount = document.getElementById("activeCount");
const completeCount = document.getElementById("completeCount");

/*=====================================================
    STORAGE KEYS
=====================================================*/

const STORAGE_KEY = "taskflow_tasks";
const THEME_KEY = "taskflow_theme";

/*=====================================================
    APPLICATION STATE
=====================================================*/

let tasks = [];

let currentFilter = "all";

let editingTaskId = null;

let deletingTaskId = null;

let searchText = "";

/*=====================================================
    INITIALIZATION
=====================================================*/

document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {

    loadTheme();

    updateGreeting();

    updateCurrentDate();

    loadTasks();

    attachStaticEvents();

    render();

}

/*=====================================================
    LOCAL STORAGE
=====================================================*/

function loadTasks() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {

        tasks = [];

        return;

    }

    try {

        tasks = JSON.parse(saved);

    } catch {

        tasks = [];

    }

}

function saveTasks() {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(tasks)

    );

}

/*=====================================================
    THEME
=====================================================*/

function loadTheme() {

    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

    }

    updateThemeIcon();

}

function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem(

        THEME_KEY,

        isDark ? "dark" : "light"

    );

    updateThemeIcon();

}

function updateThemeIcon() {

    themeToggle.innerHTML =

        document.body.classList.contains("dark")

            ? `<i class="ri-sun-line"></i>`

            : `<i class="ri-moon-line"></i>`;

}

/*=====================================================
    DATE & GREETING
=====================================================*/

function updateGreeting() {

    const hour = new Date().getHours();

    let greeting = "Hello";

    if (hour >= 5 && hour < 12) {

        greeting = "Good Morning";

    } else if (hour < 17) {

        greeting = "Good Afternoon";

    } else if (hour < 21) {

        greeting = "Good Evening";

    } else {

        greeting = "Good Night";

    }

    greetingEl.textContent = greeting;

}

function updateCurrentDate() {

    currentDateEl.textContent =

        new Date().toLocaleDateString(

            "en-IN",

            {

                weekday: "long",

                day: "numeric",

                month: "long",

                year: "numeric"

            }

        );

}

/*=====================================================
    UTILITIES
=====================================================*/

function generateId() {

    return crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) +
          Math.random().toString(36).slice(2);

}

function escapeHTML(value = "") {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}

function formatDate(date) {

    if (!date) return "No Due Date";

    return new Date(date).toLocaleDateString(

        "en-IN",

        {

            day: "numeric",

            month: "short",

            year: "numeric"

        }

    );

}

function formatDateTime(date) {

    return new Date(date).toLocaleString(

        "en-IN",

        {

            day: "numeric",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit"

        }

    );

}

function isOverdue(date) {

    if (!date) return false;

    const today = new Date();

    today.setHours(0,0,0,0);

    return new Date(date) < today;

}

/*=====================================================
    BADGE HELPERS
=====================================================*/

function categoryClass(category) {

    return `category-${category.toLowerCase()}`;

}

function priorityClass(priority) {

    return `priority-${priority.toLowerCase()}`;

}

/*=====================================================
    MAIN RENDER
=====================================================*/

function render() {

    renderStatistics();

    renderTabs();

    renderTaskList();

    toggleEmptyState();

}
/*=====================================================
    MODALS
=====================================================*/

function openTaskModal(edit = false, task = null) {

    resetForm();

    if (edit && task) {

        editingTaskId = task.id;

        modalTitle.textContent = "Edit Task";

        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description;
        taskCategoryInput.value = task.category;
        taskPriorityInput.value = task.priority;
        taskDueDateInput.value = task.dueDate;

    } else {

        editingTaskId = null;

        modalTitle.textContent = "Add New Task";

    }

    taskModal.classList.remove("hidden");

    taskTitleInput.focus();

}

function closeTaskModal() {

    taskModal.classList.add("hidden");

    resetForm();

}

function resetForm() {

    taskForm.reset();

    editingTaskId = null;

    taskIdInput.value = "";

}

function openDeleteModal(id) {

    deletingTaskId = id;

    deleteModal.classList.remove("hidden");

}

function closeDeleteModal() {

    deletingTaskId = null;

    deleteModal.classList.add("hidden");

}

/*=====================================================
    VALIDATION
=====================================================*/

function validateTask() {

    const title = taskTitleInput.value.trim();

    if (!title) {

        showToast(

            "Validation",

            "Task title is required.",

            "warning"

        );

        taskTitleInput.focus();

        return false;

    }

    if (title.length < 3) {

        showToast(

            "Validation",

            "Title should contain at least 3 characters.",

            "warning"

        );

        taskTitleInput.focus();

        return false;

    }

    if (taskDueDateInput.value) {

        const today = new Date();

        today.setHours(0,0,0,0);

        const due = new Date(taskDueDateInput.value);

        if (due < today) {

            showToast(

                "Invalid Date",

                "Due date cannot be in the past.",

                "warning"

            );

            taskDueDateInput.focus();

            return false;

        }

    }

    return true;

}

/*=====================================================
    CREATE TASK
=====================================================*/

function createTask() {

    const task = {

        id: generateId(),

        title: taskTitleInput.value.trim(),

        description: taskDescriptionInput.value.trim(),

        category: taskCategoryInput.value,

        priority: taskPriorityInput.value,

        dueDate: taskDueDateInput.value,

        completed: false,

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString()

    };

    tasks.unshift(task);

    saveTasks();

    render();

    closeTaskModal();

    showToast(

        "Task Created",

        `"${task.title}" added successfully.`,

        "success"

    );

}

/*=====================================================
    UPDATE TASK
=====================================================*/

function updateTask() {

    const task = tasks.find(

        item => item.id === editingTaskId

    );

    if (!task) return;

    task.title = taskTitleInput.value.trim();

    task.description = taskDescriptionInput.value.trim();

    task.category = taskCategoryInput.value;

    task.priority = taskPriorityInput.value;

    task.dueDate = taskDueDateInput.value;

    task.updatedAt = new Date().toISOString();

    saveTasks();

    render();

    closeTaskModal();

    showToast(

        "Task Updated",

        `"${task.title}" updated successfully.`,

        "success"

    );

}

/*=====================================================
    SAVE TASK
=====================================================*/

function handleTaskSubmit(event) {

    event.preventDefault();

    if (!validateTask()) return;

    if (editingTaskId) {

        updateTask();

    } else {

        createTask();

    }

}

/*=====================================================
    COMPLETE TASK
=====================================================*/

function toggleComplete(id) {

    const task = tasks.find(

        item => item.id === id

    );

    if (!task) return;

    task.completed = !task.completed;

    task.updatedAt = new Date().toISOString();

    saveTasks();

    render();

    showToast(

        task.completed

            ? "Task Completed"

            : "Task Reopened",

        task.completed

            ? `"${task.title}" completed.`

            : `"${task.title}" moved back to active.`,

        "success"

    );

}

/*=====================================================
    DELETE TASK
=====================================================*/

function deleteTask() {

    if (!deletingTaskId) return;

    const task = tasks.find(

        item => item.id === deletingTaskId

    );

    tasks = tasks.filter(

        item => item.id !== deletingTaskId

    );

    saveTasks();

    render();

    closeDeleteModal();

    showToast(

        "Task Deleted",

        task

            ? `"${task.title}" deleted successfully.`

            : "Task removed.",

        "error"

    );

}

/*=====================================================
    EDIT TASK
=====================================================*/

function editTask(id) {

    const task = tasks.find(

        item => item.id === id

    );

    if (!task) return;

    openTaskModal(true, task);

}
/*=====================================================
    RENDER TASK LIST
=====================================================*/

function renderTaskList() {

    let filtered = [...tasks];

    /*----------------------------
        SEARCH
    -----------------------------*/

    if (searchText) {

        const keyword = searchText.toLowerCase();

        filtered = filtered.filter(task =>

            task.title.toLowerCase().includes(keyword) ||

            task.description.toLowerCase().includes(keyword) ||

            task.category.toLowerCase().includes(keyword)

        );

    }

    /*----------------------------
        CATEGORY
    -----------------------------*/

    if (categoryFilter.value !== "all") {

        filtered = filtered.filter(

            task => task.category === categoryFilter.value

        );

    }

    /*----------------------------
        STATUS
    -----------------------------*/

    switch (currentFilter) {

        case "active":

            filtered = filtered.filter(

                task => !task.completed

            );

            break;

        case "completed":

            filtered = filtered.filter(

                task => task.completed

            );

            break;

    }

    /*----------------------------
        SORT
    -----------------------------*/

    filtered = sortTasks(filtered);

    taskContainer.innerHTML = "";

    if (filtered.length === 0) {

        taskContainer.innerHTML = "";

        return;

    }

    filtered.forEach(task => {

        taskContainer.appendChild(

            createTaskCard(task)

        );

    });

}

/*=====================================================
    CREATE TASK CARD
=====================================================*/

function createTaskCard(task) {

    const card = document.createElement("article");

    card.className = `task-card ${task.completed ? "completed" : ""}`;

    if (isOverdue(task.dueDate) && !task.completed) {

        card.style.borderLeftColor = "#ef4444";

    }

    card.innerHTML = `

        <div class="task-header">

            <div>

                <h3 class="task-title">

                    ${escapeHTML(task.title)}

                </h3>

                <p class="task-description">

                    ${escapeHTML(

                        task.description ||

                        "No description"

                    )}

                </p>

            </div>

        </div>

        <div class="task-meta">

            <span class="badge ${categoryClass(task.category)}">

                <i class="ri-price-tag-3-line"></i>

                ${task.category}

            </span>

            <span class="badge ${priorityClass(task.priority)}">

                <i class="ri-flag-line"></i>

                ${task.priority}

            </span>

            <span class="badge date-badge">

                <i class="ri-calendar-line"></i>

                ${formatDate(task.dueDate)}

            </span>

        </div>

        <div class="task-footer">

            <div class="task-time">

                Updated :
                ${formatDateTime(task.updatedAt)}

            </div>

            <div class="task-actions">

                <button
                    class="action-btn complete-btn"
                    data-action="complete"
                    data-id="${task.id}"
                    title="${
                        task.completed
                            ? "Mark Active"
                            : "Complete Task"
                    }">

                    <i class="${
                        task.completed
                            ? "ri-refresh-line"
                            : "ri-check-line"
                    }"></i>

                </button>

                <button
                    class="action-btn edit-btn"
                    data-action="edit"
                    data-id="${task.id}"
                    title="Edit">

                    <i class="ri-edit-line"></i>

                </button>

                <button
                    class="action-btn delete-btn"
                    data-action="delete"
                    data-id="${task.id}"
                    title="Delete">

                    <i class="ri-delete-bin-line"></i>

                </button>

            </div>

        </div>

    `;

    return card;

}

/*=====================================================
    STATISTICS
=====================================================*/

function renderStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(

        task => task.completed

    ).length;

    const pending = total - completed;

    totalTasksEl.textContent = total;

    completedTasksEl.textContent = completed;

    pendingTasksEl.textContent = pending;

}

/*=====================================================
    TAB COUNTS
=====================================================*/

function renderTabs() {

    allCount.textContent = tasks.length;

    activeCount.textContent =

        tasks.filter(

            task => !task.completed

        ).length;

    completeCount.textContent =

        tasks.filter(

            task => task.completed

        ).length;

}

/*=====================================================
    EMPTY STATE
=====================================================*/

function toggleEmptyState() {

    if (tasks.length === 0) {

        emptyState.classList.remove("hidden");

        taskContainer.classList.add("hidden");

    } else {

        emptyState.classList.add("hidden");

        taskContainer.classList.remove("hidden");

    }

}
/*=====================================================
    SORT TASKS
=====================================================*/

function sortTasks(taskList) {

    const sorted = [...taskList];

    switch (sortSelect.value) {

        case "oldest":

            sorted.sort(

                (a, b) =>

                    new Date(a.createdAt) -

                    new Date(b.createdAt)

            );

            break;

        case "priority":

            const priorityOrder = {

                High: 1,

                Medium: 2,

                Low: 3

            };

            sorted.sort(

                (a, b) =>

                    priorityOrder[a.priority] -

                    priorityOrder[b.priority]

            );

            break;

        case "duedate":

            sorted.sort((a, b) => {

                if (!a.dueDate && !b.dueDate) return 0;

                if (!a.dueDate) return 1;

                if (!b.dueDate) return -1;

                return new Date(a.dueDate) - new Date(b.dueDate);

            });

            break;

        case "az":

            sorted.sort((a, b) =>

                a.title.localeCompare(b.title)

            );

            break;

        default:

            sorted.sort(

                (a, b) =>

                    new Date(b.createdAt) -

                    new Date(a.createdAt)

            );

    }

    return sorted;

}

/*=====================================================
    TOAST NOTIFICATION
=====================================================*/

function showToast(title, message, type = "success") {

    const icons = {

        success: "ri-checkbox-circle-fill",

        warning: "ri-error-warning-fill",

        error: "ri-close-circle-fill"

    };

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `

        <i class="${icons[type]}"></i>

        <div class="toast-content">

            <div class="toast-title">

                ${title}

            </div>

            <div class="toast-message">

                ${message}

            </div>

        </div>

    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform = "translateX(80px)";

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}


/*=====================================================
    STATIC EVENT BINDINGS
=====================================================*/

function attachStaticEvents() {

    /*--------------------------
        Theme
    --------------------------*/

    themeToggle.addEventListener("click", toggleTheme);

    /*--------------------------
        Task Modal
    --------------------------*/

    openTaskModalBtn.addEventListener("click", () => {

        openTaskModal();

    });

    emptyCreateTaskBtn.addEventListener("click", () => {

        openTaskModal();

    });

    closeTaskModalBtn.addEventListener("click", closeTaskModal);

    cancelTaskBtn.addEventListener("click", closeTaskModal);

    taskForm.addEventListener("submit", handleTaskSubmit);

    /*--------------------------
        Delete Modal
    --------------------------*/

    confirmDeleteBtn.addEventListener("click", deleteTask);

    cancelDeleteBtn.addEventListener("click", closeDeleteModal);

    /*--------------------------
        Search
    --------------------------*/

    searchInput.addEventListener("input", event => {

        searchText = event.target.value.trim();

        renderTaskList();

    });

    /*--------------------------
        Category Filter
    --------------------------*/

    categoryFilter.addEventListener("change", () => {

        renderTaskList();

    });

    /*--------------------------
        Sorting
    --------------------------*/

    sortSelect.addEventListener("change", () => {

        renderTaskList();

    });

    /*--------------------------
        Status Tabs
    --------------------------*/

    tabButtons.forEach(button => {

        button.addEventListener("click", () => {

            tabButtons.forEach(btn =>

                btn.classList.remove("active")

            );

            button.classList.add("active");

            currentFilter = button.dataset.filter;

            renderTaskList();

        });

    });

    /*--------------------------
        Task Card Actions
    --------------------------*/

    taskContainer.addEventListener("click", handleTaskActions);

    /*--------------------------
        Close Modal Outside
    --------------------------*/

    window.addEventListener("click", event => {

        if (event.target === taskModal) {

            closeTaskModal();

        }

        if (event.target === deleteModal) {

            closeDeleteModal();

        }

    });

    /*--------------------------
        Escape Key
    --------------------------*/

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {

            closeTaskModal();

            closeDeleteModal();

        }

    });

}

/*=====================================================
    TASK ACTION HANDLER
=====================================================*/

function handleTaskActions(event) {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;

    const id = button.dataset.id;

    switch (action) {

        case "complete":

            toggleComplete(id);

            break;

        case "edit":

            editTask(id);

            break;

        case "delete":

            openDeleteModal(id);

            break;

    }

}

/*=====================================================
    OPTIONAL DEMO DATA
=====================================================*/

/*

if(tasks.length===0){

tasks.push({

id:generateId(),

title:"Design Homepage",

description:"Complete dashboard UI.",

category:"Work",

priority:"High",

dueDate:"",

completed:false,

createdAt:new Date().toISOString(),

updatedAt:new Date().toISOString()

});

saveTasks();

render();

}

*/

/*=====================================================
    END OF FILE
=====================================================*/