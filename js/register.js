// convert Image
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// password strength
function checkStrength() {
    const password = document.getElementById("password").value;
    const strengthBar = document.getElementById("strength-bar");
    const strengthText = document.getElementById("strength-text");
    const container = document.querySelector(".strength-container");

    if (password.length === 0) {
        container.style.display = "none";
        strengthText.textContent = "";
        return false;
    }

    container.style.display = "block";
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    let typeCount = [hasLetters, hasNumbers, hasSpecial].filter(Boolean).length;
    
    strengthBar.className = ""; 

    if (password.length < 6 || typeCount <= 1) {
        strengthBar.classList.add("weak");
        strengthText.textContent = "Weak";
        strengthText.style.color = "#ff4d4d";
        return false; 
    } else if (typeCount === 2) {
        strengthBar.classList.add("medium");
        strengthText.textContent = "Good";
        strengthText.style.color = "#ffd700";
        return true;
    } else {
        strengthBar.classList.add("strong");
        strengthText.textContent = "Strong";
        strengthText.style.color = "#2ecc71";
        return true;
    }
}

// main logic
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("email-error");
    const passInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");
    const matchError = document.getElementById("match-error");
    const fileInput = document.getElementById("profilePic");
    const fileNameDisplay = document.getElementById("file-name");
    const urlInput = document.getElementById("picture-url");


     phoneInput.addEventListener("input", () => {
    const error = document.getElementById("phone-error");

    
    // Logic for validation
    if (phoneInput.value.length === 0) {
        error.textContent = "";
        phoneInput.style.borderColor = "#ccc";
        phoneInput.setCustomValidity(""); 
    } else if (phoneInput.value.length !== 10) {
        error.textContent = "Phone must be exactly 10 digits.";
        phoneInput.style.borderColor = "#ff4d4d";
        phoneInput.setCustomValidity("Invalid phone number"); 
    } else {
        error.textContent = "";
        phoneInput.style.borderColor = "#2ecc71";
        phoneInput.setCustomValidity(""); 
    }
});

    // realtime email validation
    emailInput.addEventListener("input", () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailInput.value === "") {
            emailInput.style.borderColor ="#ccc";
            if(emailError) emailError.style.display = "none";
            emailInput.setCustomValidity(""); 
        } else if (!emailRegex.test(emailInput.value)) {
            emailInput.style.borderColor = "#ff4d4d"; 
            if(emailError) emailError.style.display = "block";
            emailInput.setCustomValidity("Invalid email format");
        } else {
            emailInput.style.borderColor = "#2ecc71"; 
            if(emailError) emailError.style.display = "none";
            emailInput.setCustomValidity(""); 
        }
    });

    // file name dislay and validation
    fileInput.addEventListener("change", function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

            if (!validTypes.includes(file.type)) {
                showToast("Only JPEG, JPG and PNG formats are allowed!","error");
                this.value = ""; 
                fileNameDisplay.textContent = "Invalid format";
                fileNameDisplay.style.color = "#ff4d4d";
            } else {
                fileNameDisplay.textContent = file.name;
                fileNameDisplay.style.color = "#2ecc71";
                urlInput.value = ""; 
            }
        } else {
            fileNameDisplay.textContent = "No file chosen";
            fileNameDisplay.style.color = "#555";
        }
    });

    // clear if url entered
    urlInput.addEventListener("input", () => {
        if (urlInput.value.trim() !== "") {
            fileInput.value = ""; 
            fileNameDisplay.textContent = "No file chosen";
            fileNameDisplay.style.color = "#555";
        }
    });

    // left icon focus
    document.querySelectorAll(".left-icon").forEach(icon => {
        icon.addEventListener("click", () => {
            const parent = icon.closest(".input-box") || icon.closest(".profile-box");
            const target = parent.querySelector("input, select");
            if (target) target.focus();
        });
    });

    // password matching
    const validateMatch = () => {
        if (confirmInput.value === "") {
            matchError.style.display = "none";
            confirmInput.style.borderColor = "#ccc";
        } else if (confirmInput.value !== passInput.value) {
            matchError.style.display = "block";
            confirmInput.style.borderColor = "#ff4d4d";
        } else {
            matchError.style.display = "none";
            confirmInput.style.borderColor = "#2ecc71";
        }
    };

    confirmInput.addEventListener("input", validateMatch);
    passInput.addEventListener("input", validateMatch);

    // form submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Final Email Regex Check
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailInput.value)) {
            showToast("Please enter a valid email address!","error");
            return;
        }
        if (!checkStrength()) {
            showToast("Password does not meet requirements!","error");
            return;
        }
        if (passInput.value !== confirmInput.value) {
            showToast("Passwords do not match!","error");
            return;
        }
        if (phoneInput.value.length !== 10) {
            showToast("Please enter a valid 10-digit phone number!", "error");
            return;
        }

        const username = document.getElementById("username").value;
        const email = emailInput.value;
        const phone = document.getElementById("phone").value;
        const gender = document.getElementById("gender").value;

        // PROFILE IMAGE LOGIC
        let profileImage = "https://cdn-icons-png.flaticon.com/512/6325/6325109.png"; 

        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            if (file.size > 1024 * 1024) {
                showToast("Image is too large! Please choose a file under 1MB.","error");
                return; 
            }
            profileImage = await toBase64(file);
        } else if (urlInput.value.trim() !== "") {
            profileImage = urlInput.value;
        }

        let userArray = JSON.parse(localStorage.getItem("registered_users")) || [];

        // check user exist
        const exists = userArray.some(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
        if (exists) {
            showToast("Email or Phone already registered!", "error");
            return;
        }

        const newUser = {
            username,
            email,
            phone,
            gender,
            password: passInput.value,
            profileImage: profileImage,
            tasks: [] 
        };

        try {
            userArray.push(newUser);
            localStorage.setItem("registered_users", JSON.stringify(userArray));
            // sessionStorage.setItem("currentUser", JSON.stringify(newUser));
            // sessionStorage.setItem("userLoggedIn", "true");

            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Registering...';
            btn.disabled = true;

            setTimeout(() => {
                showToast("Registration successful!");
                setTimeout(() => {
                    window.location.href = "login.html";
            }, 800);
        },700);
        } catch (error) {
            showToast("Storage full! Try using an Image URL instead of an upload.","error");
          
        }
    });
});