(function () {
  const CURRENT_KEY = "edu_current_user";
  const AVATAR_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#9333ea", "#f43f5e", "#14b8a6"];

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

  // 已禁用自动跳转
  // async function checkSessionAndRedirect() {
  //   const sb = getSupabase();
  //   if (!sb) return;
  //   const { data: { session } } = await sb.auth.getSession();
  //   if (session) {
  //     window.location.href = "index.html";
  //   }
  // }
  // checkSessionAndRedirect();

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

  // 注册表单处理
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

      // 验证输入
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

      const sb = await getSupabase();
      if (!sb) {
        showMessage("Supabase 未加载，请刷新页面", false);
        return;
      }

      try {
        // 1. 调用 supabase.auth.signUp 注册
        const { data, error: authError } = await sb.auth.signUp({ email, password });

        if (authError) {
          console.error("Auth signUp error:", authError);
          showMessage("注册失败，请重试", false);
          return;
        }

        if (!data.user || !data.user.id) {
          console.error("No user ID returned from signUp");
          showMessage("注册失败，请重试", false);
          return;
        }

        const userId = data.user.id;
        console.log("User registered successfully, ID:", userId);

        // 2. 往 user_info 插入 id、username、email（登录时按用户名查邮箱）
        let insertError = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          const res = await sb.from("user_info").insert([{ id: userId, username, email }]);
          insertError = res.error;
          if (!insertError) break;
          if (attempt === 0) await new Promise((r) => setTimeout(r, 300));
        }
        if (insertError) {
          console.error("Insert user_info error:", insertError);
          showMessage("注册成功但保存用户信息失败，请刷新后重试登录", false);
          return;
        }

        // 注册成功后跳转到登录页
        showMessage("注册成功，请登录", true);
        setTimeout(() => {
          window.location.href = "login.html";
        }, 800);
      } catch (err) {
        console.error("Registration error:", err);
        showMessage("注册失败，请重试", false);
      }
    });
  }

  // 登录表单处理（仅支持用户名+密码，邮箱仅用于找回密码）
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const usernameInput = loginForm.username.value.trim();
      const password = loginForm.password.value;

      if (!usernameInput) {
        showMessage("请输入用户名", false);
        return;
      }

      const sb = await getSupabase();
      if (!sb) {
        showMessage("Supabase 未加载，请刷新页面", false);
        return;
      }

      // 从 user_info 按用户名查邮箱（不区分大小写）
      const { data: userData, error: queryError } = await sb
        .from("user_info")
        .select("email, username")
        .ilike("username", usernameInput)
        .limit(1)
        .maybeSingle();

      if (queryError || !userData) {
        showMessage("用户名不存在", false);
        return;
      }

      const email = userData.email;
      const username = userData.username;

      const { error: authError } = await sb.auth.signInWithPassword({ email, password });

      if (authError) {
        showMessage("密码错误", false);
        return;
      }

      localStorage.setItem(CURRENT_KEY, username);
      showMessage("登录成功，正在跳转...", true);
      setTimeout(() => {
        window.location.replace("index.html");
      }, 400);
    });
  }
})();
