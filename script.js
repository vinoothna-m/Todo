// ================================
// ELEMENTS
// ================================

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const taskCount = document.getElementById("taskCount");

const addBtn = document.getElementById("addTaskBtn");
const modal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveTask");

const taskInput = document.getElementById("taskInput");
const taskDescription = document.getElementById("taskDescription");
const modalTitle = document.getElementById("modalTitle");

const themeBtn = document.getElementById("themeBtn");

const toast = document.getElementById("toast");

const notes = document.getElementById("notes");
const focus = document.getElementById("focus");
const remember = document.getElementById("remember");

const confirmModal = document.getElementById("confirmModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let editIndex = null;
let deleteIndex = null;

// ================================
// STORAGE
// ================================

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadText(id, element) {
    element.value = localStorage.getItem(id) || "";

    element.addEventListener("input", () => {
        localStorage.setItem(id, element.value);
    });
}

loadText("notes", notes);
loadText("focus", focus);
loadText("remember", remember);

// ================================
// DARK MODE
// ================================

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeBtn.onclick = () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");

        themeBtn.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

    } else {

        localStorage.setItem("theme", "light");

        themeBtn.innerHTML =
            '<i class="fa-solid fa-moon"></i>';

    }

};

// ================================
// MODAL
// ================================

function openModal(edit = false) {

    modal.classList.add("show");

    taskInput.focus();

    if (!edit) {

        modalTitle.textContent = "Add Task";

        taskInput.value = "";
        taskDescription.value = "";

        editIndex = null;

    }

}

function closeTaskModal() {

    modal.classList.remove("show");

}

addBtn.onclick = () => openModal();

closeModal.onclick = closeTaskModal;

cancelBtn.onclick = closeTaskModal;

// ================================
// TOAST
// ================================

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

// ================================
// SAVE TASK
// ================================

saveBtn.onclick = saveTask;

taskInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        saveTask();

    }

});

function saveTask() {

    const title = taskInput.value.trim();

    const desc = taskDescription.value.trim();

    if (!title) return;

    if (editIndex === null) {

        tasks.push({

            title,

            desc,

            completed: false

        });

        showToast("✓ Task Added");

    } else {

        tasks[editIndex].title = title;

        tasks[editIndex].desc = desc;

        showToast("✓ Task Updated");

    }

    saveTasks();

    renderTasks();

    closeTaskModal();

}

// ================================
// KEYBOARD SHORTCUTS
// ================================

document.addEventListener("keydown", e => {

    if (e.ctrlKey && e.key.toLowerCase() === "n") {

        e.preventDefault();

        openModal();

    }

    if (e.ctrlKey && e.key.toLowerCase() === "d") {

        e.preventDefault();

        themeBtn.click();

    }

    if (e.key === "Escape") {

        closeTaskModal();

        confirmModal.classList.remove("show");

    }

});
// ================================
// RENDER TASKS
// ================================

function renderTasks() {

    taskList.innerHTML = "";

    taskCount.textContent = `${tasks.length} Task${tasks.length !== 1 ? "s" : ""}`;

    emptyState.style.display = tasks.length ? "none" : "block";

    tasks.forEach((task, index) => {

        const li = document.createElement("li");
        li.className = "task";

        if (task.completed) li.classList.add("completed");

        li.innerHTML = `
            <div class="task-left">

                <input type="checkbox" ${task.completed ? "checked" : ""}>

                <div class="task-content">

                    <div class="task-title">${task.title}</div>

                    ${task.desc ? `<div class="task-desc">${task.desc}</div>` : ""}

                </div>

            </div>

            <div class="task-actions">

                <button class="icon-btn edit">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button class="icon-btn delete">
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>
        `;

        // Complete Task
        li.querySelector("input").onclick = () => {

            task.completed = !task.completed;

            saveTasks();

            renderTasks();

            if (tasks.length && tasks.every(t => t.completed)) {

                showToast("🎉 All Tasks Completed!");

                launchConfetti();

            }

        };

        // Edit Task
        li.querySelector(".edit").onclick = () => {

            editIndex = index;

            modalTitle.textContent = "Edit Task";

            taskInput.value = task.title;

            taskDescription.value = task.desc;

            openModal(true);

        };

        // Delete Task
        li.querySelector(".delete").onclick = () => {

            deleteIndex = index;

            confirmModal.classList.add("show");

        };

        taskList.appendChild(li);

    });

}

// ================================
// DELETE
// ================================

confirmDelete.onclick = () => {

    tasks.splice(deleteIndex, 1);

    saveTasks();

    renderTasks();

    confirmModal.classList.remove("show");

    showToast("🗑 Task Deleted");

};

cancelDelete.onclick = () => {

    confirmModal.classList.remove("show");

};

// Close modal by clicking outside
window.onclick = e => {

    if (e.target === modal)
        closeTaskModal();

    if (e.target === confirmModal)
        confirmModal.classList.remove("show");

};

// ================================
// SIMPLE CONFETTI
// ================================

const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});

function launchConfetti() {

    let particles = [];

    for (let i = 0; i < 120; i++) {

        particles.push({

            x: Math.random() * canvas.width,
            y: -20,

            size: Math.random() * 8 + 4,

            speed: Math.random() * 4 + 2,

            color: `hsl(${Math.random() * 360},80%,60%)`

        });

    }

    let animation = setInterval(() => {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {

            p.y += p.speed;

            ctx.fillStyle = p.color;

            ctx.fillRect(p.x, p.y, p.size, p.size);

        });

    }, 16);

    setTimeout(() => {

        clearInterval(animation);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

    }, 2000);

}

// ================================
// INITIALIZE
// ================================

renderTasks();