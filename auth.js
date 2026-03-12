(function () {
  const USERS_KEY = "edu_users";
  const CURRENT_KEY = "edu_current_user";
  const AVATAR_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#9333ea", "#f43f5e", "#14b8a6"];

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const message = document.getElementById("message");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const usernameCheck = document.getElementById("usernameCheck");
  const confirmCheck = document.getElementById("confirmCheck");
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  const avatarOptions = document.getElementById("avatarOptions");
  const avatarValue = document.getElementById("avatarValue");

  if (localStorage.getItem(CURRENT_KEY)) {
    window.location.href = "index.html";
    return;
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (_err) {
      return [];
    }
  }

  function setUsers(list) {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  }

  function isUsernameTaken(name) {
    const users = getUsers();
    return users.some((u) => u.username.toLowerCase() === name.toLowerCase());
  }

  function validPassword(pwd) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(pwd);
  }

  function getStrength(pwd) {
    if (!pwd) return { level: 0, text: "请输入密码", color: "#94a3b8", width: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Za-z]/.test(pwd) && /\d/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && pwd.length >= 12) score += 1;
    if (score <= 1) return { level: 1, text: "弱", color: "#ef4444", width: 33 };
    if (score === 2) return { level: 2, text: "中", color: "#f59e0b", width: 66 };
    return { level: 3, text: "强", color: "#22c55e", width: 100 };
  }

  function showMessage(text, ok) {
    if (!message) return;
    message.textContent = text;
    message.className = ok ? "msg ok" : "msg error";
  }

  function renderAvatarOptions() {
    if (!avatarOptions) return;
    avatarOptions.innerHTML = "";
    AVATAR_COLORS.forEach((color, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `avatar-option${idx === 0 ? " active" : ""}`;
      btn.style.background = color;
      btn.addEventListener("click", () => {
        avatarOptions.querySelectorAll(".avatar-option").forEach((el) => el.classList.remove("active"));
        btn.classList.add("active");
        avatarValue.value = color;
      });
      avatarOptions.appendChild(btn);
    });
  }

  if (registerForm) {
    renderAvatarOptions();

    usernameInput.addEventListener("input", () => {
      const val = usernameInput.value.trim();
      if (!val) {
        usernameCheck.textContent = "请输入 3~32 位用户名";
        usernameCheck.className = "hint";
        return;
      }
      if (isUsernameTaken(val)) {
        usernameCheck.textContent = "用户名已存在";
        usernameCheck.className = "hint bad";
      } else {
        usernameCheck.textContent = "用户名可用";
        usernameCheck.className = "hint ok";
      }
    });

    passwordInput.addEventListener("input", () => {
      const state = getStrength(passwordInput.value);
      strengthBar.style.width = `${state.width}%`;
      strengthBar.style.background = state.color;
      strengthText.textContent = `密码强度：${state.text}`;
      strengthText.className = validPassword(passwordInput.value) ? "hint ok" : "hint bad";
    });

    confirmInput.addEventListener("input", () => {
      if (confirmInput.value === passwordInput.value) {
        confirmCheck.textContent = "两次密码一致";
        confirmCheck.className = "hint ok";
      } else {
        confirmCheck.textContent = "两次密码不一致";
        confirmCheck.className = "hint bad";
      }
    });

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = usernameInput.value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      const avatar = avatarValue.value || AVATAR_COLORS[0];

      if (isUsernameTaken(username)) {
        showMessage("用户名已存在", false);
        return;
      }
      if (!validPassword(password)) {
        showMessage("密码需 8~16 位且必须包含字母和数字", false);
        return;
      }
      if (password !== confirm) {
        showMessage("两次输入密码不一致", false);
        return;
      }

      const users = getUsers();
      users.push({
        username,
        password,
        avatarColor: avatar,
        profile: {
          nickname: username,
          realName: "",
          school: "",
          birthday: "",
          gender: "未填写"
        },
        stats: { totalMinutes: 0, wrongCount: 0 },
        progress: {
          videosWatched: [],
          booksRead: [],
          quizTotal: 0,
          quizCorrect: 0,
          homeworkScore: 0
        },
        wrongBook: [],
        subscribed: false
      });
      setUsers(users);
      showMessage("注册成功，正在跳转登录页...", true);
      setTimeout(() => {
        window.location.href = "login.html";
      }, 700);
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value;
      const users = getUsers();
      const user = users.find((u) => u.username === username && u.password === password);
      if (!user) {
        showMessage("用户名或密码错误", false);
        return;
      }
      localStorage.setItem(CURRENT_KEY, username);
      showMessage("登录成功，正在跳转首页...", true);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 400);
    });
  }
})();
