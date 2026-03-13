(function() {
  const form = document.getElementById("forgotForm");
  const message = document.getElementById("message");

  async function waitSupabase() {
    for (let i = 0; i < 50; i++) {
      if (window.supabaseClient) return window.supabaseClient;
      await new Promise((r) => setTimeout(r, 100));
    }
    return null;
  }

  function showMessage(text, ok) {
    if (!message) return;
    message.textContent = text;
    message.className = ok ? "msg ok" : "msg error";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();

      if (!isValidEmail(email)) {
        showMessage("请输入有效的邮箱地址", false);
        return;
      }

      const sb = await waitSupabase();
      if (!sb) {
        showMessage("Supabase 未加载，请刷新页面", false);
        return;
      }

      try {
        const emailLower = email.toLowerCase();
        const base = window.location.origin || "http://localhost:3000";
        const redirectUrl = base + (base.endsWith("/") ? "" : "/") + "reset-password.html";
        const { error } = await sb.auth.resetPasswordForEmail(emailLower, {
          redirectTo: redirectUrl
        });

        if (error) {
          showMessage(error.message || "发送失败，请重试", false);
          return;
        }

        showMessage("若该邮箱已注册，您将收到重置链接，请查收邮箱", true);
      } catch (err) {
        console.error(err);
        showMessage("发送失败，请重试", false);
      }
    });
  }
})();
