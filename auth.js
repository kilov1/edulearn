(function () {
  const CURRENT_KEY = "edu_current_user";
  const AVATAR_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#9333ea", "#f43f5e", "#14b8a6"];

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const message = document.getElementById("message");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const emailCheck = document.getElementById("emailCheck");
  const confirmCheck = document.getElementById("confirmCheck");
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  const avatarOptions = document.getElementById("avatarOptions");
  const avatarValue = document.getElementById("avatarValue");

  function renderAvatarOptions() {
    if (!avatarOptions || !avatarValue) return;
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

  async function getSupabase() {
    if (window.supabaseClient) return window.supabaseClient;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 100));
      if (window.supabaseClient) return window.supabaseClient;
    }
    return null;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  // 注册：邮箱 + 密码 + 头像
  if (registerForm) {
    renderAvatarOptions();

    if (emailCheck && emailInput) {
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

    if (passwordInput && strengthBar && strengthText) {
      passwordInput.addEventListener("input", () => {
        const state = getStrength(passwordInput.value);
        strengthBar.style.width = `${state.width}%`;
        strengthBar.style.background = state.color;
        strengthText.textContent = `密码强度：${state.text}`;
        strengthText.className = validPassword(passwordInput.value) ? "hint ok" : "hint bad";
      });
    }

    if (confirmInput && confirmCheck) {
      confirmInput.addEventListener("input", () => {
        if (confirmInput.value === passwordInput.value) {
          confirmCheck.textContent = "两次密码一致";
          confirmCheck.className = "hint ok";
        } else {
          confirmCheck.textContent = "两次密码不一致";
          confirmCheck.className = "hint bad";
        }
      });
    }

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirm = confirmInput.value;

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

      const sb = await getSupabase();
      if (!sb) {
        showMessage("Supabase 未加载，请刷新页面", false);
        return;
      }

      try {
        const emailLower = email.toLowerCase();
        const { data, error: authError } = await sb.auth.signUp({
          email: emailLower,
          password,
          options: { data: { email: emailLower } }
        });

        if (authError) {
          console.error("Auth signUp error:", authError);
          const msg = (authError.message || "").toLowerCase();
          if (msg.includes("already registered") || msg.includes("already exists")) {
            showMessage("该邮箱已被注册，请直接登录或使用忘记密码", false);
          } else {
            showMessage(authError.message || "注册失败，请重试", false);
          }
          return;
        }

        if (!data.user || !data.user.id) {
          showMessage("注册失败，请重试", false);
          return;
        }

        const userId = data.user.id;
        let insertError = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          const res = await sb.from("user_info").insert([{ id: userId, email: emailLower, nickname: null }]);
          insertError = res.error;
          if (!insertError) break;
          if (attempt === 0) await new Promise((r) => setTimeout(r, 300));
        }
        if (insertError) {
          console.error("Insert user_info error:", insertError);
          showMessage("注册成功但保存信息失败，请直接登录或联系管理员", false);
          return;
        }

        localStorage.setItem(CURRENT_KEY, emailLower);
        sessionStorage.setItem("edu_show_nickname_popup", "1");
        sessionStorage.setItem("edu_register_avatar", avatarValue?.value || AVATAR_COLORS[0]);
        showMessage("注册成功，正在跳转...", true);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 600);
      } catch (err) {
        console.error("Registration error:", err);
        showMessage("注册失败，请重试", false);
      }
    });
  }

  // 登录：邮箱 + 密码
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = (loginForm.email?.value || "").trim().toLowerCase();
      const password = loginForm.password.value;

      if (!email || !isValidEmail(email)) {
        showMessage("请输入有效的邮箱地址", false);
        return;
      }

      const sb = await getSupabase();
      if (!sb) {
        showMessage("Supabase 未加载，请刷新页面", false);
        return;
      }

      const { error: authError } = await sb.auth.signInWithPassword({ email, password });

      if (authError) {
        showMessage("邮箱或密码错误", false);
        return;
      }

      localStorage.setItem(CURRENT_KEY, email);
      showMessage("登录成功，正在跳转...", true);
      setTimeout(() => {
        window.location.replace("index.html");
      }, 400);
    });
  }
})();
