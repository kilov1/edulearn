(function () {
  const USERS_KEY = "edu_users";
  const CURRENT_KEY = "edu_current_user";
  const AVATAR_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#9333ea", "#f43f5e", "#14b8a6"];
  const EMAIL_SUFFIX = "@edulearn.local";

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const message = document.getElementById("message");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const usernameCheck = document.getElementById("usernameCheck");
  const emailCheck = document.getElementById("emailCheck");
  const confirmCheck = document.getElementById("confirmCheck");
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  const avatarOptions = document.getElementById("avatarOptions");
  const avatarValue = document.getElementById("avatarValue");

  function getSupabase() {
    return window.supabaseClient || null;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  async function checkSessionAndRedirect() {
    const sb = getSupabase();
    if (!sb) return;
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      window.location.href = "index.html";
    }
  }

  checkSessionAndRedirect();

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

  function createDefaultUser(username, avatar, email) {
    return {
      username,
      email: email || "",
      avatarColor: avatar || AVATAR_COLORS[0],
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
    };
  }

  function ensureUserInStorage(username, avatar, email) {
    const users = getUsers();
    let user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      user = createDefaultUser(username, avatar, email);
      users.push(user);
      setUsers(users);
    }
    return user;
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

    if (usernameCheck) {
      usernameInput.addEventListener("input", () => {
        const val = usernameInput.value.trim();
        if (!val || val.length < 3 || val.length > 32) {
          usernameCheck.textContent = "请输入 3~32 位用户名";
          usernameCheck.className = "hint";
          return;
        }
        usernameCheck.textContent = "用户名已填写";
        usernameCheck.className = "hint ok";
      });
    }

    if (emailCheck) {
      emailInput.addEventListener("input", () => {
        const val = emailInput.value.trim();
        if (!val || !isValidEmail(val)) {
          emailCheck.textContent = "请输入有效的邮箱地址";
          emailCheck.className = "hint";
          return;
        }
        emailCheck.textContent = "邮箱格式正确";
        emailCheck.className = "hint ok";
      });
    }

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

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      const avatar = avatarValue.value || AVATAR_COLORS[0];

      if (!username || username.length < 3 || username.length > 32) {
        showMessage("用户名需 3~32 位", false);
        return;
      }
      if (!isValidEmail(email)) {
        showMessage("请输入有效的邮箱地址", false);
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

      const sb = getSupabase();
      if (!sb) {
        showMessage("Supabase 未加载，请刷新页面", false);
        return;
      }

      const { data, error } = await sb.auth.signUp({ email, password });

      if (error) {
        if (error.message && (error.message.includes("already") || error.message.includes("registered"))) {
          showMessage("邮箱已被注册", false);
        } else {
          showMessage(error.message || "注册失败", false);
        }
        return;
      }

      ensureUserInStorage(username, avatar, email);
      localStorage.setItem(CURRENT_KEY, username);
      showMessage("注册成功，正在跳转首页...", true);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 700);
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value;

      if (!username) {
        showMessage("请输入用户名", false);
        return;
      }

      const sb = getSupabase();
      if (!sb) {
        showMessage("Supabase 未加载，请刷新页面", false);
        return;
      }

      // 从本地存储查找用户，获取其邮箱
      const users = getUsers();
      const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      
      if (!user || !user.email) {
        showMessage("用户名不存在", false);
        return;
      }

      // 用邮箱和密码登录 Supabase
      const { data, error } = await sb.auth.signInWithPassword({ email: user.email, password });

      if (error) {
        showMessage("密码错误", false);
        return;
      }

      ensureUserInStorage(username);
      localStorage.setItem(CURRENT_KEY, username);
      showMessage("登录成功，正在跳转首页...", true);
      setTimeout(() => {
        window.location.href = "index.html";
      }, 400);
    });
  }
})();
