import {
    httpRequest,
    renderUser,
    initControl,
    initPopularSong,
    $,
    $$,
    escapeHTML,
    userRender,
    showToast,
    removeShowToast,
} from "./ultis/module.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
    const signupBtn = document.querySelector(".signup-btn");
    const loginBtn = document.querySelector(".login-btn");
    const authModal = document.getElementById("authModal");
    const modalClose = document.getElementById("modalClose");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const showLoginBtn = document.getElementById("showLogin");
    const showSignupBtn = document.getElementById("showSignup");

    // Function to show signup form
    function showSignupForm() {
        signupForm.style.display = "block";
        loginForm.style.display = "none";
    }

    // Function to show login form
    function showLoginForm() {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    }

    // Function to open modal
    function openModal() {
        authModal.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    // Open modal with Sign Up form when clicking Sign Up button
    signupBtn.addEventListener("click", function () {
        showSignupForm();
        openModal();
    });

    // Open modal with Login form when clicking Login button
    loginBtn.addEventListener("click", function () {
        showLoginForm();
        openModal();
    });

    // Close modal function
    function closeModal() {
        authModal.classList.remove("show");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    // Close modal when clicking close button
    modalClose.addEventListener("click", closeModal);

    // Close modal when clicking overlay (outside modal container)
    // authModal.addEventListener("click", function (e) {
    //     if (e.target === authModal) {
    //         closeModal();
    //     }
    // });

    // Close modal with Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && authModal.classList.contains("show")) {
            closeModal();
        }
    });

    // Switch to Login form
    showLoginBtn.addEventListener("click", function () {
        showLoginForm();
    });

    // Switch to Signup form
    showSignupBtn.addEventListener("click", function () {
        showSignupForm();
    });
    // Prevent form submission for demo purposes
    const signUp = signupForm.querySelector(".auth-form-content");
    const login = loginForm.querySelector(".auth-form-content");
    // handle show erro messgae
    function handleErrorMessage(email, password, message) {
        const invalidEmail = email.closest(".form-group");
        const invalidPassword = password.closest(".form-group");

        invalidEmail.classList.remove("invalid");
        invalidPassword.classList.remove("invalid");
        email.innerHTML = "";
        password.innerHTML = "";
        message.forEach((item) => {
            if (item.field === "email") {
                invalidEmail.classList.add("invalid");
                email.innerHTML = `<i class="fas fa-info-circle"></i>
                <span
                >${escapeHTML(item.message)}</span
                >`;
            }
            if (item.field === "password") {
                invalidPassword.classList.add("invalid");
                password.innerHTML = `<i class="fas fa-info-circle"></i>
                                        <span
                                            >${escapeHTML(item.message)}</span
                                        >`;
            }
        });
    }
    // log out

    logoutBtn.addEventListener("click", async function (e) {
        const token = localStorage.getItem("accessToken");
        try {
            const res = await httpRequest.post("auth/logout");
            localStorage.removeItem("accessToken");
            setTimeout(location.reload(), 0);
        } catch (error) {
            console.log(error);
        }
    });
    // đăng nhập
    login.addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = document.querySelector("#loginEmail").value;
        const password = document.querySelector("#loginPassword").value;
        const errorGmail = login.querySelector(".error-message.error-email");
        const errorPassWord = login.querySelector(
            ".error-message.error-password"
        );
        const created = {
            email,
            password,
        };
        try {
            const { user, access_token } = await httpRequest.post(
                "auth/login",
                created
            );
            localStorage.setItem("accessToken", access_token);
            setTimeout(() => {
                location.reload();
            }, 0);
        } catch (error) {
            switch (error?.response?.error?.code) {
                case "VALIDATION_ERROR":
                    const message = error?.response?.error?.details;
                    handleErrorMessage(errorGmail, errorPassWord, message);
                    break;
                case "RATE_LIMIT_EXCEEDED":
                    console.log(
                        "Too many authentication attempts, please try again later."
                    );
                    break;
                default:
                    console.log("có lỗi xảy ra");
                    break;
            }
        }
    });
    // đăng kí
    signUp.addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = document.querySelector("#signupEmail").value;
        const password = document.querySelector("#signupPassword").value;
        const errorGmail = signUp.querySelector(".error-message.error-email");
        const errorPassWord = signUp.querySelector(
            ".error-message.error-password"
        );
        const created = {
            username: "truongvd5",
            email,
            password,
        };
        try {
            const { user, access_token } =
                (await httpRequest.post("auth/register", created)) || {};
            localStorage.setItem("accessToken", access_token);
            setTimeout(() => {
                location.reload();
            }, 0);
        } catch (error) {
            switch (error?.response?.error?.code) {
                case "VALIDATION_ERROR":
                    const message = error?.response?.error?.details;
                    handleErrorMessage(errorGmail, errorPassWord, message);
                    break;
                case "RATE_LIMIT_EXCEEDED":
                    console.log(
                        "Too many authentication attempts, please try again later."
                    );
                    break;
                default:
                    console.log("có lỗi xảy ra");
                    break;
            }
        }
    });
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
    const userAvatar = document.getElementById("userAvatar");
    const userDropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    // Toggle dropdown when clicking avatar
    userAvatar.addEventListener("click", function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        if (
            !userAvatar.contains(e.target) &&
            !userDropdown.contains(e.target)
        ) {
            userDropdown.classList.remove("show");
        }
    });

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && userDropdown.classList.contains("show")) {
            userDropdown.classList.remove("show");
        }
    });

    // Handle logout button click
    logoutBtn.addEventListener("click", function () {
        // Close dropdown first
        userDropdown.classList.remove("show");

        console.log("Logout clicked");
        // TODO: Students will implement logout logic here
    });
});

// Other functionality
document.addEventListener("DOMContentLoaded", async function () {
    const authButton = document.querySelector(".auth-buttons");
    const avatarButton = document.querySelector(".user-avatar");
    const userName = document.querySelector(".user-name");
    const unserMenu = document.querySelector(".user-menu");
    let user = null;
    initControl();
    userRender();
    showToast();
    try {
        const res = await httpRequest.get("users/me");
        user = res.user;
    } catch {
        authButton.classList.add("show");
        avatarButton.style.display = "none";
    }
    if (user) {
        authButton.classList.remove("show");
        avatarButton.style.display = "flex";
        unserMenu.style.display = "flex";
        renderUser(user, userName);
        initPopularSong();
        removeShowToast();
    }
});
