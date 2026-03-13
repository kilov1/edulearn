(function() {
  // 防止重复执行路由守卫
  if (window.__routeGuardExecuted) return;
  window.__routeGuardExecuted = true;

  // 防止无限跳转的标记（使用内存变量而非 sessionStorage，避免 Tracking Prevention 问题）
  let lastRedirectTime = 0;
  const REDIRECT_TIMEOUT = 2000; // 2秒内不重复跳转

  function canRedirect() {
    const now = Date.now();
    const elapsed = now - lastRedirectTime;
    return elapsed > REDIRECT_TIMEOUT;
  }

  function markRedirecting() {
    lastRedirectTime = Date.now();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    let sb = window.supabaseClient;
    if (!sb) {
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 100));
        sb = window.supabaseClient;
        if (sb) break;
      }
    }
    if (!sb) {
      console.log("[route-guard] Supabase 未初始化，跳过路由检查");
      return;
    }

    try {
      const { data: { session }, error } = await sb.auth.getSession();
      
      if (error) {
        console.error("[route-guard] 获取 session 失败:", error);
        return;
      }

      const currentPage = document.body.getAttribute("data-page");
      console.log("[route-guard] 当前页面:", currentPage, "session:", !!session);

      // 如果不能跳转（冷却中），跳过检查
      if (!canRedirect()) {
        console.log("[route-guard] 跳转冷却中，跳过检查");
        return;
      }

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

      console.log("[route-guard] 无需跳转，停留在当前页面");
    } catch (err) {
      console.error("[route-guard] 路由守卫异常:", err);
    }
  });
})();
