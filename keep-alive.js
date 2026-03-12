(function () {
  "use strict";

  // 防休眠：每天轻轻请求一次 Supabase，保持项目活跃
  async function keepSupabaseAlive() {
    if (!window.supabaseClient) return;

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastKeepAliveDate = localStorage.getItem("supabase_keep_alive_date");

    // 如果今天已经请求过，就不再请求
    if (lastKeepAliveDate === today) return;

    try {
      // 轻量请求：获取当前用户信息（无论登录与否都不会报错）
      await window.supabaseClient.auth.getUser();
      
      // 记录今天已请求
      localStorage.setItem("supabase_keep_alive_date", today);
    } catch (error) {
      // 静默失败，不影响任何功能
      console.debug("[KeepAlive] Supabase request completed");
    }
  }

  // 页面加载完成后执行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", keepSupabaseAlive);
  } else {
    keepSupabaseAlive();
  }
})();
