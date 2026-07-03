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

const toast = document.getElementById("toast");
const themeBtn = document.getElementById("themeBtn");

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

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    totalTasks.innerText = total;

    completedTasks.innerText = completed;

    pendingTasks.innerText = pending;

    let percentage = 0;

    if(total > 0){
        percentage = (completed / total) * 100;
    }

    progress.style.width = percentage + "%";
}

themeBtn.onclick = () => {

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeBtn.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    }
    else{

        localStorage.setItem("theme","light");

        themeBtn.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

    }

};

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

    themeBtn.innerHTML =
    '<i class="fa-solid fa-sun"></i>';

}
function addTask() {

    const text = taskInput.value.trim();

    if(text === ""){

        showToast("Please enter a task");

        return;

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

    renderTasks();

    taskInput.value = "";

    dueDate.value = "";

    dueTime.value = "";

    priority.value = "Medium";

    showToast("Task Added");

}

document.getElementById("addTask").addEventListener("click", addTask);

function toggleTask(id){

    tasks = tasks.map(task=>{

        if(task.id===id){

            task.completed=!task.completed;

        }

        return task;

    });

    saveTasks();

    renderTasks();

}

function deleteTask(id){

    tasks = tasks.filter(task=>task.id!==id);

    saveTasks();

    renderTasks();

    showToast("Task Deleted");

}

function editTask(id){

    const task = tasks.find(task=>task.id===id);

    const updated = prompt("Edit Task",task.text);

    if(updated!==null && updated.trim()!==""){

        task.text = updated.trim();

        saveTasks();

        renderTasks();

        showToast("Task Updated");

    }

}

function renderTasks(list = tasks){

    taskList.innerHTML = "";

    if(list.length===0){

        taskList.innerHTML =

        `<div class="empty">

        <h2>No Tasks Found</h2>

        <p>Add a new task to get started 🚀</p>

        </div>`;

        updateStats();

        return;

    }

    list.forEach(task=>{

        taskList.innerHTML += `

        <li class="task ${task.completed ? "completed" : ""}">

            <div class="task-left">

                <input

                type="checkbox"

                ${task.completed ? "checked":""}

                onchange="toggleTask(${task.id})">

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

                </div>

            </div>

            <div class="task-actions">

                <button

                class="edit-btn"

                onclick="editTask(${task.id})">

                <i class="fa-solid fa-pen"></i>

                </button>

                <button

                class="delete-btn"

                onclick="deleteTask(${task.id})">

                <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </li>

        `;

    });

    updateStats();

}
function searchTasks(){

    const value = search.value.toLowerCase();

    const filtered = tasks.filter(task=>
        task.text.toLowerCase().includes(value)
    );

    renderTasks(filtered);

}

search.addEventListener("keyup",searchTasks);

document.querySelectorAll(".filters button").forEach(button=>{

    button.addEventListener("click",()=>{

        const filter = button.dataset.filter;

        if(filter==="all"){

            renderTasks(tasks);

        }

        else if(filter==="completed"){

            renderTasks(tasks.filter(task=>task.completed));

        }

        else if(filter==="pending"){

            renderTasks(tasks.filter(task=>!task.completed));

        }

    });

});

function pinTask(id){

    tasks = tasks.map(task=>{

        if(task.id===id){

            task.pinned = !task.pinned;

        }

        return task;

    });

    tasks.sort((a,b)=>b.pinned-a.pinned);

    saveTasks();

    renderTasks();

}

document.getElementById("sortPriority").addEventListener("click",()=>{

    const order={

        High:3,

        Medium:2,

        Low:1

    };

    tasks.sort((a,b)=>

        order[b.priority]-order[a.priority]

    );

    saveTasks();

    renderTasks();

    showToast("Sorted by Priority");

});

document.getElementById("sortDate").addEventListener("click",()=>{

    tasks.sort((a,b)=>{

        if(a.date==="" && b.date==="") return 0;

        if(a.date==="") return 1;

        if(b.date==="") return -1;

        return new Date(a.date)-new Date(b.date);

    });

    saveTasks();

    renderTasks();

    showToast("Sorted by Date");

});

function clearCompleted(){

    tasks = tasks.filter(task=>!task.completed);

    saveTasks();

    renderTasks();

    showToast("Completed Tasks Cleared");

}

document
.getElementById("clearCompleted")
.addEventListener("click",clearCompleted);
taskInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        addTask();

    }

});

function checkAllCompleted(){

    if(tasks.length===0){

        return;

    }

    const completed=tasks.every(task=>task.completed);

    if(completed){

        showToast("🎉 Congratulations! All tasks completed!");

        confetti();

    }

}

function confetti(){

    for(let i=0;i<150;i++){

        const piece=document.createElement("div");

        piece.style.position="fixed";

        piece.style.width="10px";

        piece.style.height="10px";

        piece.style.left=Math.random()*100+"vw";

        piece.style.top="-20px";

        piece.style.backgroundColor=`hsl(${Math.random()*360},100%,50%)`;

        piece.style.borderRadius="50%";

        piece.style.zIndex="9999";

        piece.style.pointerEvents="none";

        piece.style.transition="transform 3s linear, opacity 3s";

        document.body.appendChild(piece);

        setTimeout(()=>{

            piece.style.transform=`translateY(${window.innerHeight+100}px)`;

            piece.style.opacity="0";

        },50);

        setTimeout(()=>{

            piece.remove();

        },3000);

    }

}

const oldRender=renderTasks;

renderTasks=function(list=tasks){

    oldRender(list);

    checkAllCompleted();

};

window.onload=()=>{

    renderTasks();

};

window.toggleTask=toggleTask;
window.editTask=editTask;
window.deleteTask=deleteTask;
window.pinTask=pinTask;