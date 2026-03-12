document.addEventListener("DOMContentLoaded", async () => {
  const sb = window.supabaseClient;
  if (!sb) return;

  // 延迟 500ms 确保 Supabase 完全初始化
  await new Promise(resolve => setTimeout(resolve, 500));

  const { data: { session } } = await sb.auth.getSession();
  const currentPage = document.body.getAttribute("data-page");

  // 已登录用户访问 login 页面 → 跳转到 index
  if (currentPage === "login" && session) {
    window.location.href = "index.html";
    return;
  }

  // 未登录用户访问 home 页面 → 跳转到 login
  if (currentPage === "home" && !session) {
    window.location.href = "login.html";
    return;
  }

  // register 页面：已登录用户 → 跳转到 index
  if (currentPage === "register" && session) {
    window.location.href = "index.html";
    return;
  }

  // 其他情况保持当前页面，不跳转
});
