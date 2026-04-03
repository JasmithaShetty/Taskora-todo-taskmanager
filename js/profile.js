// --- GLOBAL VARIABLES ---
// We initialize these at the top so every function can see them
let currentUserEmail = localStorage.getItem("currentUser");
let users = JSON.parse(localStorage.getItem("registered_users")) || [];
let currentUser = users.find(u => u.email === currentUserEmail);

document.addEventListener("DOMContentLoaded", () => {
    // 1. Auth Check
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // 2. Initial Display
    displayUserData(currentUser);

    // 3. Handle URL Hash on load
    if (window.location.hash === "#edit") {
        toggleEdit(true);
    }

    // --- REAL-TIME VALIDATIONS ---
    const phoneInput = document.getElementById("edit-phone");
    const passInput = document.getElementById("edit-password");
    const confirmInput = document.getElementById("edit-confirm-password");

    // Phone Validation
    phoneInput.addEventListener("input", () => {
        const error = document.getElementById("phone-error");
        // Remove non-numeric characters automatically
        phoneInput.value = phoneInput.value.replace(/\D/g, "");
        
        if (phoneInput.value.length > 0 && phoneInput.value.length !== 10) {
            error.textContent = "Phone must be exactly 10 digits.";
            phoneInput.style.borderColor = "#ff4d4d";
        } else {
            error.textContent = "";
            phoneInput.style.borderColor = "#ccc";
        }
    });

    // Password Validation
    const validatePass = () => {
        const passErr = document.getElementById("pass-error");
        const matchErr = document.getElementById("match-error");

        if (passInput.value.length > 0 && passInput.value.length < 6) {
            passErr.textContent = "Password must be at least 6 characters.";
        } else {
            passErr.textContent = "";
        }

        if (confirmInput.value && passInput.value !== confirmInput.value) {
            matchErr.textContent = "Passwords do not match!";
            confirmInput.style.borderColor = "#ff4d4d";
        } else {
            matchErr.textContent = "";
            confirmInput.style.borderColor = "#ccc";
        }
    };

    passInput.addEventListener("input", validatePass);
    confirmInput.addEventListener("input", validatePass);

    // Logout Logic
    document.getElementById("logoutBtn").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
});

// --- HELPER FUNCTIONS ---

function displayUserData(user) {
    document.getElementById("profileDisplay").src = user.profileImage || "https://via.placeholder.com/120";
    document.getElementById("view-username").textContent = user.username;
    document.getElementById("view-email").textContent = user.email;
    document.getElementById("view-phone").textContent = user.phone || "-";
    document.getElementById("view-gender").textContent = user.gender || "-";
    
    const passSpan = document.getElementById("view-password");
    if (user.password) {
        passSpan.textContent = "•".repeat(user.password.length);
        passSpan.classList.add("dots");
    }
}

function toggleViewPassword(icon) {
    const passSpan = document.getElementById("view-password");
    // Refresh user data from global variable
    if (passSpan.classList.contains("dots")) {
        passSpan.textContent = currentUser.password;
        passSpan.classList.remove("dots");
        icon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        passSpan.textContent = "•".repeat(currentUser.password.length);
        passSpan.classList.add("dots");
        icon.classList.replace("fa-eye", "fa-eye-slash");
    }
}

function toggleEdit(isEditing) {
    const view = document.getElementById("view-section");
    const edit = document.getElementById("edit-section");
    const editBtn = document.getElementById("edit-pic-btn");
    const tabView = document.getElementById("tab-view");
    const tabEdit = document.getElementById("tab-edit");
    
    if (isEditing) {
        view.style.display = "none";
        edit.style.display = "block";
        editBtn.style.display = "block";
        tabEdit.classList.add("active");
        tabView.classList.remove("active");
        window.location.hash = "edit";
        populateFields();
    } else {
        view.style.display = "block";
        edit.style.display = "none";
        editBtn.style.display = "none";
        tabView.classList.add("active");
        tabEdit.classList.remove("active");
        window.location.hash = "view";
        document.getElementById("pic-options-menu").style.display = "none";
    }
}

function populateFields() {
    if (!currentUser) return;
    document.getElementById("edit-username").value = currentUser.username;
    document.getElementById("edit-email").value = currentUser.email;
    document.getElementById("edit-phone").value = currentUser.phone || "";
    document.getElementById("edit-gender").value = currentUser.gender || "None";
    document.getElementById("edit-password").value = "";
    document.getElementById("edit-confirm-password").value = "";
}

function enableField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.disabled = false;
    el.focus();

    if (id === "edit-password") {
        document.getElementById("edit-confirm-password").disabled = false;
    }
}

// --- IMAGE HANDLING ---

function togglePicMenu() {
    const menu = document.getElementById("pic-options-menu");
    menu.style.display = menu.style.display === "none" ? "block" : "none";
}

function applyUrl() {
    const url = document.getElementById("urlInput").value.trim();
    if (!url) return;
    document.getElementById("profileDisplay").src = url;
    togglePicMenu();
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById("profileDisplay").src = e.target.result;
            togglePicMenu();
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// --- SAVE LOGIC ---

async function saveChanges() {
    // 1. Validate Inputs
    const phoneVal = document.getElementById("edit-phone").value;
    const passVal = document.getElementById("edit-password").value;
    const confirmVal = document.getElementById("edit-confirm-password").value;

    if (phoneVal.length !== 10) { 
        alert("Phone must be exactly 10 digits"); 
        return; 
    }
    if (passVal && passVal.length < 6) { 
        alert("Password must be at least 6 characters"); 
        return; 
    }
    if (passVal !== confirmVal) { 
        alert("Passwords do not match"); 
        return; 
    }

    // 2. Create updated object
    const updatedUser = {
        ...currentUser,
        username: document.getElementById("edit-username").value,
        phone: phoneVal,
        gender: document.getElementById("edit-gender").value,
        profileImage: document.getElementById("profileDisplay").src
    };
    
    if (passVal) updatedUser.password = passVal;

    // 3. Find index in global users array and update
    const idx = users.findIndex(u => u.email === currentUserEmail);
    if (idx !== -1) {
        users[idx] = updatedUser; 
        currentUser = updatedUser; // Update global reference
        
        localStorage.setItem("registered_users", JSON.stringify(users));
        
        // Use alert if showToast isn't defined, or keep showToast
        if (typeof showToast === "function") {
            showToast("Profile Updated Successfully!", "success");
        }

        displayUserData(updatedUser);
        setTimeout(() => toggleEdit(false), 900);
    }
}