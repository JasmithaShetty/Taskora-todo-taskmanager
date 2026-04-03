document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById("username").value.trim();
        const passwordInput = document.getElementById("password").value;
        const btn = loginForm.querySelector(".login-btn");

        if (!usernameInput || !passwordInput) {
            showToast("Please fill all fields", "error");
            return;
        }

        const registeredUsers = JSON.parse(localStorage.getItem("registered_users")) || [];

        const user = registeredUsers.find(u => 
            u.username.toLowerCase() === usernameInput.toLowerCase() ||
            u.email.toLowerCase() === usernameInput.toLowerCase()
        );

        if (!user) {
            showToast("Account not found!", "error");
            return;
        }

        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Logging in...';

        if (user.password === passwordInput) {
            localStorage.setItem("currentUser", user.email);

            showToast(`Welcome back, ${user.username}!`);

            setTimeout(() => {
                window.location.href = "todo.html";
            }, 1500);

        } else {
            showToast("Incorrect password. Please try again.", "error");
            document.getElementById("password").value = "";
            btn.innerHTML = "Login";
        }
    });
});