(function() {
  const form = document.getElementById("resetForm");
  const message = document.getElementById("message");

  function showMessage(text, ok) {
    if (!message) return;
    message.textContent = text;
    message.className = ok ? "msg ok" : "msg error";
  }

  function validPassword(pwd) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(pwd);
  }

  async function waitSupabase() {
    for (let i = 0; i < 50; i++) {
      if (window.supabaseClient) return window.supabaseClient;
      await new Promise((r) => setTimeout(r, 100));
    }
    return null;
  }

  (async function init() {
    const sb = await waitSupabase();
    if (!sb) {
      showMessage("Supabase 未加载，请刷新页面", false);
      return;
    }

    // 处理 Supabase 重定向后的 hash（含 access_token）
    const { data: { session }, error } = await sb.auth.getSession();
    if (error || !session) {
      showMessage("链接已失效或已使用，请重新申请重置", false);
      return;
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPassword = form.newPassword.value;
        const confirm = form.confirmPassword.value;

        if (!validPassword(newPassword)) {
          showMessage("密码需 8~16 位且包含字母和数字", false);
          return;
        }
        if (newPassword !== confirm) {
          showMessage("两次密码不一致", false);
          return;
        }

        try {
          const { error: updateError } = await sb.auth.updateUser({ password: newPassword });
          if (updateError) {
            showMessage(updateError.message || "更新失败", false);
            return;
          }
          showMessage("密码已更新，正在跳转登录...", true);
          setTimeout(() => {
            window.location.replace("login.html");
          }, 1000);
        } catch (err) {
          showMessage("更新失败，请重试", false);
        }
      });
    }
  })();
})();
