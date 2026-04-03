// password visibility
function togglePassword(inputId, icon) {
    
    const passwordInput = document.getElementById(inputId);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        passwordInput.type = "password";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    }
}

// notification
function showToast(message, type = "success") { 
    const container = document.getElementById("notification");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "error" : ""}`;
const icon =
    type === "success"
        ? "fa-circle-check"
        : type === "error"
        ? "fa-circle-exclamation"
        : "fa-trash";    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 800);
}