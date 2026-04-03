// // login logic
// document.addEventListener("DOMContentLoaded", () => {
//     const loginForm = document.getElementById("loginForm");

//     loginForm.addEventListener("submit", (e) => {
//         e.preventDefault();

//         const usernameInput = document.getElementById("username").value.trim();
//         const passwordInput = document.getElementById("password").value;

//         // retrieve users from localStorage
//         const registeredUsers = JSON.parse(localStorage.getItem("registered_users")) || [];

//         // check if the user exists at all (by username or email)
//         const userExists = registeredUsers.some(u => u.username.toLowerCase() === usernameInput.toLowerCase() || u.email.toLowerCase() === usernameInput.toLowerCase());

//         if (!userExists) {
//             showToast("Account not found!", "error");
//             return;
//         }

//         // check if credentials are correct
//         const validUser = registeredUsers.find(u => 
//             (u.username.toLowerCase() === usernameInput.toLowerCase() || u.email.toLowerCase() === usernameInput.toLowerCase()) && 
//             u.password === passwordInput
//         );

//         if (validUser) {
//             // login successful
//             localStorage.setItem("currentUser", validUser.email);

//             const btn = loginForm.querySelector(".login-btn");
//             btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Logging in ...';

//             showToast(`Welcome!, ${validUser.username}`);
            
//             setTimeout(() => {
//                 window.location.href = "todo.html"; 
//             }, 900);

//         } else {
//             //wrong password
//             showToast("Incorrect password. Please try again.", "error");
//             document.getElementById("password").value = "";
//         }
//     });
// });


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