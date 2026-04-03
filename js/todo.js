// variables
let currentUser;
let users;
let editingTaskId = null;
let deleteTaskId = null;

// save user
function saveUser() {
    const idx = users.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) {
        users[idx] = currentUser;
        localStorage.setItem("registered_users", JSON.stringify(users));
    }
}

// tasks
function renderTasks(filter = "all", searchText = "") {
    if (!currentUser.tasks) currentUser.tasks = [];
    let tasks = [...currentUser.tasks];

    const today = new Date().toISOString().split("T")[0];

    // filter
    if (filter === "pending") tasks = tasks.filter(t => !t.completed);
    else if (filter === "completed") tasks = tasks.filter(t => t.completed);

    // search
    if (searchText) {
        tasks = tasks.filter(t =>
            t.title.toLowerCase().includes(searchText.toLowerCase())
        );
    }

    // sort
   tasks.sort((a, b) => {
    // 1. incomplete first
    if (a.completed !== b.completed) {
        return a.completed - b.completed;
    }

    // 2. convert due dates safely
    const dateA = a.due ? new Date(a.due).getTime() : Infinity;
    const dateB = b.due ? new Date(b.due).getTime() : Infinity;

    // 3. nearest due date first
    return dateA - dateB;
});

    // stats
    document.getElementById("total-tasks").textContent = currentUser.tasks.length;
    document.getElementById("completed-tasks").textContent =
        currentUser.tasks.filter(t => t.completed).length;
    document.getElementById("pending-today").textContent =
        currentUser.tasks.filter(t => !t.completed && t.due === today).length;

    const taskListEl = document.getElementById("task-list");

    if (tasks.length === 0) {
        taskListEl.innerHTML =
            `<tr><td colspan="5" class="empty">No tasks found</td></tr>`;
        return;
    }

    taskListEl.innerHTML = tasks.map(task => {

        const isOverdue =
            !task.completed &&
            task.due &&
            new Date(task.due).setHours(0, 0, 0, 0) <
            new Date().setHours(0, 0, 0, 0);

        let statusClass = "task-row";
        if (task.completed) statusClass += " completed";
        else if (isOverdue) statusClass += " overdue";

        return `
        <tr class="${statusClass}" data-id="${task.id}">
            <td class="status-circle">
                <i class="${task.completed ? "fas fa-check-circle" : "far fa-circle"}"></i>
            </td>
            <td>${task.title}</td>
            <td>${task.description || '-'}</td>
            <td>
                ${task.due || '-'} 
                ${isOverdue ? '<i class="fas fa-clock"></i>' : ''}
            </td>
            <td class="actions">
            <i class="fas fa-pencil-alt edit-task ${task.completed ? 'disabled' : ''}"></i>
            <i class="fas fa-trash delete-task"></i>
            </td>
        </tr>
        `;
    }).join("");
}

// modal
function closeModal() {
    document.getElementById("editTaskModal").style.display = "none";
}

function saveTaskEdit() {
    const title = document.getElementById("modal-title").value.trim();
    const desc = document.getElementById("modal-desc").value.trim();
    const due = document.getElementById("modal-due").value;

    const today = new Date().toISOString().split("T")[0]
    
    if (!title) {
        showToast("Title cannot be empty!", "error");
        return;
    }
 if (!due || due < today) {
        showToast("Invalid due date!", "error");
        return;
    }
    const task = currentUser.tasks.find(t => t.id === editingTaskId);
    if (!task) return;
    if (task.completed) return;

    task.title = title;
    task.description = desc;
    task.due = due;

    saveUser();
    renderTasks();
    closeModal();

    showToast("Task updated successfully!");
}


//main
document.addEventListener("DOMContentLoaded", () => {

    const currentUserEmail = localStorage.getItem("currentUser");
    users = JSON.parse(localStorage.getItem("registered_users")) || [];
    currentUser = users.find(u => u.email === currentUserEmail);

    if (!currentUser) {
        showToast("Session expired! Redirecting...", "error");
        window.location.href = "login.html";
        return;
    }

    const addTaskBtn = document.getElementById("add-task-btn");
    const taskTitleInput = document.getElementById("task-title");
    const taskDueInput = document.getElementById("task-due");
    const taskDescInput = document.getElementById("task-desc");
    const searchInput = document.getElementById("search-task");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const logoutBtn = document.getElementById("logout");
    const taskListEl = document.getElementById("task-list");

    const today = new Date().toISOString().split("T")[0];

    // prevent past date
    taskDueInput.setAttribute("min", today);

    taskDueInput.addEventListener("blur", () => {
        if (taskDueInput.value && taskDueInput.value < today) {
            showToast("Due date cannot be before today!", "error");
            taskDueInput.value = "";
        }
    });

    // logout
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });

    // add task
    addTaskBtn.addEventListener("click", () => {

        const title = taskTitleInput.value.trim();
        const due = taskDueInput.value;
        const desc = taskDescInput.value.trim();

        if (!title) return showToast("Task title required!", "error");
        if (due && due < today || !due) return showToast("Invalid date!", "error");

        if (!currentUser.tasks) currentUser.tasks = [];

        const id = currentUser.tasks.length
            ? Math.max(...currentUser.tasks.map(t => t.id)) + 1
            : 1;

        currentUser.tasks.push({
            id,
            title,
            due,
            description: desc,
            completed: false
        });

        saveUser();
        renderTasks();

        taskTitleInput.value = "";
        taskDueInput.value = "";
        taskDescInput.value = "";

        showToast("Task added successfully!");
    });

    // filter
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderTasks(btn.dataset.filter, searchInput.value);
        });
    });

    // search
    searchInput.addEventListener("input", () => {
        const active =
            document.querySelector(".filter-btn.active")?.dataset.filter || "all";
        renderTasks(active, searchInput.value);
    });

    // task action
    taskListEl.addEventListener("click", (e) => {

        const row = e.target.closest("tr");
        if (!row) return;

        const taskId = Number(row.dataset.id);
        const task = currentUser.tasks.find(t => t.id === taskId);
        if (!task) return;

        // complete
        if (e.target.closest(".status-circle")) {
            task.completed = !task.completed;
            showToast(task.completed ? "Task completed!" : "Marked pending");
        }

        // delete
        else if (e.target.classList.contains("delete-task")) {
            deleteTaskId = taskId;
    document.getElementById("deleteModal").style.display = "flex";
}
    

        // dit
        else if (e.target.classList.contains("edit-task")) {
            editingTaskId = taskId;

            document.getElementById("modal-title").value = task.title;
            document.getElementById("modal-desc").value = task.description || "";
            document.getElementById("modal-due").value = task.due || "";

            document.getElementById("editTaskModal").style.display = "flex";
        }

        saveUser();
        renderTasks();
    });

    renderTasks();
    const deleteModal = document.getElementById("deleteModal");

document.getElementById("cancelDelete").addEventListener("click", () => {
    deleteModal.style.display = "none";
    deleteTaskId = null;
});

document.getElementById("confirmDelete").addEventListener("click", () => {
    if (deleteTaskId !== null) {
        currentUser.tasks =
            currentUser.tasks.filter(t => t.id !== deleteTaskId);

        saveUser();
        renderTasks();

        showToast("Task deleted!", "delete");

        deleteTaskId = null;
    }

    deleteModal.style.display = "none";
});
const modalDueInput = document.getElementById("modal-due");

// set minimum date
modalDueInput.setAttribute("min", today);

// validate on blur
modalDueInput.addEventListener("blur", () => {
    if (modalDueInput.value && modalDueInput.value < today) {
        showToast("Due date cannot be before today!", "error");
        modalDueInput.value = "";
    }
});
});

