(function () {
  const emailForm = document.getElementById("emailForm");
  const passwordForm = document.getElementById("passwordForm");
  const stepEmail = document.getElementById("stepEmail");
  const stepPassword = document.getElementById("stepPassword");
  const stepTitle = document.getElementById("stepTitle");
  const stepDesc = document.getElementById("stepDesc");
  const message = document.getElementById("message");
  const emailInput = document.getElementById("email");
  const verifiedEmailInput = document.getElementById("verifiedEmail");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmInput = document.getElementById("confirmPassword");
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  const confirmCheck = document.getElementById("confirmCheck");

  function showMessage(text, ok) {
    if (!message) return;
    message.textContent = text;
    message.className = ok ? "msg ok" : "msg error";
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

  function showStepPassword(email) {
    if (stepEmail) stepEmail.classList.add("hidden");
    if (stepPassword) stepPassword.classList.remove("hidden");
    if (stepTitle) stepTitle.textContent = "设置新密码";
    if (stepDesc) stepDesc.textContent = "请设置您的新密码，需 8~16 位且包含字母和数字。";
    if (verifiedEmailInput) verifiedEmailInput.value = email;
    const displayEmail = document.getElementById("displayEmail");
    if (displayEmail) displayEmail.textContent = email;
    if (message) message.textContent = "";
  }

  function showStepEmail() {
    if (stepPassword) stepPassword.classList.add("hidden");
    if (stepEmail) stepEmail.classList.remove("hidden");
    if (stepTitle) stepTitle.textContent = "重置密码";
    if (stepDesc) stepDesc.textContent = "请输入注册时使用的邮箱，输入后可直接设置新密码。";
    if (message) message.textContent = "";
  }

  async function waitSupabase() {
    for (let i = 0; i < 50; i++) {
      if (window.supabaseClient) return window.supabaseClient;
      await new Promise((r) => setTimeout(r, 100));
    }
    return null;
  }

  // 步骤1：输入邮箱，进入下一步
  if (emailForm) {
    emailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (emailInput?.value || "").trim();

      if (!isValidEmail(email)) {
        showMessage("请输入有效的邮箱地址", false);
        return;
      }

      showStepPassword(email.toLowerCase());
    });
  }

  // 步骤2：密码强度与确认
  if (newPasswordInput && strengthBar && strengthText) {
    newPasswordInput.addEventListener("input", () => {
      const state = getStrength(newPasswordInput.value);
      strengthBar.style.width = `${state.width}%`;
      strengthBar.style.background = state.color;
      strengthText.textContent = `密码强度：${state.text}`;
      strengthText.className = validPassword(newPasswordInput.value) ? "hint ok" : "hint bad";
    });
  }

  const backToEmail = document.getElementById("backToEmail");
  if (backToEmail) {
    backToEmail.addEventListener("click", (e) => {
      e.preventDefault();
      showStepEmail();
    });
  }

  if (confirmInput && confirmCheck && newPasswordInput) {
    confirmInput.addEventListener("input", () => {
      if (confirmInput.value === newPasswordInput.value) {
        confirmCheck.textContent = "两次密码一致";
        confirmCheck.className = "hint ok";
      } else {
        confirmCheck.textContent = "两次密码不一致";
        confirmCheck.className = "hint bad";
      }
    });
  }

  // 步骤2：提交新密码
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (verifiedEmailInput?.value || "").trim().toLowerCase();
      const newPassword = newPasswordInput?.value || "";
      const confirm = confirmInput?.value || "";

      if (!validPassword(newPassword)) {
        showMessage("密码需 8~16 位且必须包含字母和数字", false);
        return;
      }
      if (newPassword !== confirm) {
        showMessage("两次输入密码不一致", false);
        return;
      }

      const sb = await waitSupabase();
      if (!sb) {
        showMessage("Supabase 未加载，请刷新页面", false);
        return;
      }

      showMessage("正在更新...", true);

      try {
        const { data, error } = await sb.functions.invoke("reset-password", {
          body: {
            email,
            password: newPassword,
            confirmPassword: confirm,
          },
        });

        if (error) {
          showMessage(error.message || "更新失败，请重试", false);
          return;
        }

        if (data?.error) {
          showMessage(data.error, false);
          return;
        }

        showMessage("密码已更新，正在跳转登录...", true);
        setTimeout(() => {
          window.location.replace("login.html");
        }, 1000);
      } catch (err) {
        console.error(err);
        showMessage("更新失败，请重试", false);
      }
    });
  }
})();
