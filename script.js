let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const dueTime = document.getElementById("dueTime");
const taskList = document.getElementById("taskList");
const search = document.getElementById("search");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const progress = document.getElementById("progress");
const progressPercent = document.getElementById("progressPercent");

const toast = document.getElementById("toast");
const themeBtn = document.getElementById("themeBtn");

const deleteModal = document.getElementById("deleteModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

let deleteId = null;
let currentFilter = "all";

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showToast(message) {
    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}

function updateGreeting() {

    const greeting = document.getElementById("greeting");

    const hour = new Date().getHours();

    if (hour < 12) {

        greeting.innerText = "Good Morning 🌞";

    }

    else if (hour < 18) {

        greeting.innerText = "Good Afternoon ☀";

    }

    else {

        greeting.innerText = "Good Evening 🌙";

    }

}

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    totalTasks.innerText = total;

    completedTasks.innerText = completed;

    pendingTasks.innerText = pending;

    let percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progress.style.width = percentage + "%";

    progressPercent.innerText = percentage + "%";

}

themeBtn.onclick = () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");

        themeBtn.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    }

    else {

        localStorage.setItem("theme", "light");

        themeBtn.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

    }

};

if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark");

    themeBtn.innerHTML =
    '<i class="fa-solid fa-sun"></i>';

}

function isDuplicate(text) {

    return tasks.some(task =>
        task.text.toLowerCase() ===
        text.toLowerCase()
    );

}
function addTask() {

    const text = taskInput.value.trim();

    if (text === "") {

        showToast("Please enter a task");

        return;

    }

    if (isDuplicate(text)) {

        showToast("Task already exists");

        return;

    }

    if (dueDate.value !== "") {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(dueDate.value);

        if (selectedDate < today) {

            showToast("Past date is not allowed");

            return;

        }

    }

    const task = {

        id: Date.now(),

        text: text,

        priority: priority.value,

        date: dueDate.value,

        time: dueTime.value,

        completed: false,

        pinned: false

    };

    tasks.push(task);

    saveTasks();

    applyCurrentFilter();

    taskInput.value = "";

    dueDate.value = "";

    dueTime.value = "";

    priority.value = "Medium";

    showToast("Task Added Successfully");

}

document
.getElementById("addTask")
.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        addTask();

    }

});

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            task.completed = !task.completed;

        }

        return task;

    });

    saveTasks();

    applyCurrentFilter();

}

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    const updated = prompt("Edit Task", task.text);

    if (updated === null) {

        return;

    }

    if (updated.trim() === "") {

        showToast("Task cannot be empty");

        return;

    }

    const duplicate = tasks.some(t =>

        t.id !== id &&

        t.text.toLowerCase() === updated.trim().toLowerCase()

    );

    if (duplicate) {

        showToast("Task already exists");

        return;

    }

    task.text = updated.trim();

    saveTasks();

    applyCurrentFilter();

    showToast("Task Updated");

}

function openDeleteModal(id) {

    deleteId = id;

    deleteModal.classList.add("show");

}

cancelDelete.onclick = () => {

    deleteModal.classList.remove("show");

};

confirmDelete.onclick = () => {

    tasks = tasks.filter(task => task.id !== deleteId);

    saveTasks();

    applyCurrentFilter();

    deleteModal.classList.remove("show");

    showToast("Task Deleted");

};

function pinTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            task.pinned = !task.pinned;

        }

        return task;

    });

    tasks.sort((a, b) => b.pinned - a.pinned);

    saveTasks();

    applyCurrentFilter();

    showToast("Task Updated");

}
function getTaskStatus(task) {

    if (task.date === "") {

        return {
            className: "",
            badge: ""
        };

    }

    const today = new Date();

    today.setHours(0,0,0,0);

    const due = new Date(task.date);

    due.setHours(0,0,0,0);

    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) {

        return {

            className: "overdue",

            badge: '<span class="status-badge status-overdue">Overdue</span>'

        };

    }

    if (diff === 0) {

        return {

            className: "today",

            badge: '<span class="status-badge status-today">Due Today</span>'

        };

    }

    return {

        className: "future",

        badge: `<span class="status-badge status-future">${diff} Day${diff>1?"s":""} Left</span>`

    };

}

function renderTasks(list = tasks){

    taskList.innerHTML = "";

    if(list.length===0){

        taskList.innerHTML = `

        <div class="empty">

            <h2>No Tasks Found</h2>

            <p>Add a new task to get started 🚀</p>

        </div>

        `;

        updateStats();

        return;

    }

    list.forEach(task=>{

        const status = getTaskStatus(task);

        taskList.innerHTML += `

        <li class="task ${task.completed ? "completed":""} ${status.className}">

            <div class="task-left">

                <input

                    type="checkbox"

                    ${task.completed ? "checked":""}

                    onchange="toggleTask(${task.id})"

                >

                <div class="task-content">

                    <h3>${task.text}</h3>

                    <p>

                        📅 ${task.date || "No Date"}

                        &nbsp;&nbsp;

                        ⏰ ${task.time || "--"}

                    </p>

                    <span class="priority ${task.priority.toLowerCase()}">

                        ${task.priority}

                    </span>

                    ${status.badge}

                </div>

            </div>

            <div class="task-actions">

                <button

                    class="pin-btn"

                    onclick="pinTask(${task.id})"

                    title="Pin Task"

                >

                    <i class="fa-solid fa-thumbtack"></i>

                </button>

                <button

                    class="edit-btn"

                    onclick="editTask(${task.id})"

                    title="Edit"

                >

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button

                    class="delete-btn"

                    onclick="openDeleteModal(${task.id})"

                    title="Delete"

                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </li>

        `;

    });

    updateStats();

    checkAllCompleted();

}
function searchTasks() {

    const value = search.value.toLowerCase();

    const filtered = tasks.filter(task =>
        task.text.toLowerCase().includes(value)
    );

    renderTasks(filtered);

}

search.addEventListener("keyup", searchTasks);

function applyCurrentFilter() {

    let filtered = [...tasks];

    if (currentFilter === "completed") {

        filtered = filtered.filter(task => task.completed);

    }

    else if (currentFilter === "pending") {

        filtered = filtered.filter(task => !task.completed);

    }

    renderTasks(filtered);

}

document.querySelectorAll(".filters button").forEach(button => {

    if (button.dataset.filter) {

        button.addEventListener("click", () => {

            document
            .querySelectorAll(".filters button")
            .forEach(btn => btn.classList.remove("active-filter"));

            button.classList.add("active-filter");

            currentFilter = button.dataset.filter;

            applyCurrentFilter();

        });

    }

});

document
.getElementById("sortPriority")
.addEventListener("click", () => {

    const order = {

        High: 3,

        Medium: 2,

        Low: 1

    };

    tasks.sort((a, b) => {

        if (b.pinned !== a.pinned) {

            return b.pinned - a.pinned;

        }

        return order[b.priority] - order[a.priority];

    });

    saveTasks();

    applyCurrentFilter();

    showToast("Sorted by Priority");

});

document
.getElementById("sortDate")
.addEventListener("click", () => {

    tasks.sort((a, b) => {

        if (a.date === "" && b.date === "") return 0;

        if (a.date === "") return 1;

        if (b.date === "") return -1;

        return new Date(a.date) - new Date(b.date);

    });

    saveTasks();

    applyCurrentFilter();

    showToast("Sorted by Date");

});
function clearCompleted() {

    tasks = tasks.filter(task => !task.completed);

    saveTasks();

    applyCurrentFilter();

    showToast("Completed Tasks Cleared");

}

document
.getElementById("clearCompleted")
.addEventListener("click", clearCompleted);

function checkAllCompleted() {

    if (tasks.length === 0) {

        return;

    }

    const completed = tasks.every(task => task.completed);

    if (completed) {

        showToast("🎉 Congratulations! All Tasks Completed!");

        confetti();

    }

}

function confetti() {

    for (let i = 0; i < 150; i++) {

        const piece = document.createElement("div");

        piece.style.position = "fixed";

        piece.style.width = "10px";

        piece.style.height = "10px";

        piece.style.left = Math.random() * 100 + "vw";

        piece.style.top = "-20px";

        piece.style.background =
        `hsl(${Math.random() * 360},100%,50%)`;

        piece.style.borderRadius = "50%";

        piece.style.pointerEvents = "none";

        piece.style.zIndex = "9999";

        piece.style.transition =
        "transform 3s linear, opacity 3s";

        document.body.appendChild(piece);

        setTimeout(() => {

            piece.style.transform =
            `translateY(${window.innerHeight + 100}px)`;

            piece.style.opacity = "0";

        }, 50);

        setTimeout(() => {

            piece.remove();

        }, 3000);

    }

}

window.onload = () => {

    updateGreeting();

    applyCurrentFilter();

};

window.toggleTask = toggleTask;
window.editTask = editTask;
window.pinTask = pinTask;
window.openDeleteModal = openDeleteModal;
function sortPinnedTasks() {

    tasks.sort((a, b) => {

        if (a.pinned !== b.pinned) {

            return b.pinned - a.pinned;

        }

        const order = {

            High: 3,

            Medium: 2,

            Low: 1

        };

        if (order[a.priority] !== order[b.priority]) {

            return order[b.priority] - order[a.priority];

        }

        if (a.date === "" && b.date === "") return 0;

        if (a.date === "") return 1;

        if (b.date === "") return -1;

        return new Date(a.date) - new Date(b.date);

    });

}

const originalAddTask = addTask;

addTask = function () {

    originalAddTask();

    sortPinnedTasks();

    saveTasks();

    applyCurrentFilter();

};

const originalToggleTask = toggleTask;

toggleTask = function (id) {

    originalToggleTask(id);

    sortPinnedTasks();

    saveTasks();

    applyCurrentFilter();

};

const originalClearCompleted = clearCompleted;

clearCompleted = function () {

    originalClearCompleted();

    sortPinnedTasks();

    saveTasks();

    applyCurrentFilter();

};

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        deleteModal.classList.remove("show");

    }

});

deleteModal.addEventListener("click", (e) => {

    if (e.target === deleteModal) {

        deleteModal.classList.remove("show");

    }

});

sortPinnedTasks();

applyCurrentFilter();
