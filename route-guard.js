(function() {
  // 防止重复执行路由守卫
  if (window.__routeGuardExecuted) return;
  window.__routeGuardExecuted = true;

  // 防止无限跳转的标记
  const REDIRECT_KEY = "_edu_redirecting";
  const REDIRECT_TIMEOUT = 3000; // 3秒内不重复跳转

  function isRedirecting() {
    const lastRedirect = sessionStorage.getItem(REDIRECT_KEY);
    if (!lastRedirect) return false;
    const elapsed = Date.now() - parseInt(lastRedirect, 10);
    return elapsed < REDIRECT_TIMEOUT;
  }

  function markRedirecting() {
    sessionStorage.setItem(REDIRECT_KEY, Date.now().toString());
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const sb = window.supabaseClient;
    if (!sb) return;

    // 如果正在跳转中，不再执行
    if (isRedirecting()) {
      console.log("[route-guard] 跳转冷却中，跳过检查");
      return;
    }

    try {
      // 延迟确保 Supabase 完全初始化
      await new Promise(resolve => setTimeout(resolve, 300));

      const { data: { session }, error } = await sb.auth.getSession();
      
      if (error) {
        console.error("[route-guard] 获取 session 失败:", error);
        return;
      }

      const currentPage = document.body.getAttribute("data-page");
      console.log("[route-guard] 当前页面:", currentPage, "session:", !!session);

      // 已登录用户访问 login 页面 → 跳转到 index
      if (currentPage === "login" && session) {
        console.log("[route-guard] 已登录，跳转到首页");
        markRedirecting();
        window.location.replace("index.html");
        return;
      }

      // 未登录用户访问 home 页面 → 跳转到 login
      if (currentPage === "home" && !session) {
        console.log("[route-guard] 未登录，跳转到登录页");
        markRedirecting();
        window.location.replace("login.html");
        return;
      }

      // register 页面：已登录用户 → 跳转到 index
      if (currentPage === "register" && session) {
        console.log("[route-guard] 已登录，跳转到首页");
        markRedirecting();
        window.location.replace("index.html");
        return;
      }

      // 清除跳转标记（正常停留在当前页面）
      sessionStorage.removeItem(REDIRECT_KEY);
    } catch (err) {
      console.error("[route-guard] 路由守卫异常:", err);
    }
  });
})();
