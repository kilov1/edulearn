// Supabase 加载器：先加载库，加载完成后再初始化客户端，避免 "Supabase 未加载" 错误
(function() {
  const SUPABASE_URL = "https://jlzneeyigkzhjmnpcsro.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_SbrJZV0ofP3NN8sKfMSxNw_ewfuaobn";

  // 优先使用本地文件，避免 CDN 超时或 Tracking Prevention
  const CDN_SOURCES = [
    "supabase.min.js",
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js",
    "https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js",
    "https://cdn.skypack.dev/@supabase/supabase-js@2"
  ];

  let currentIndex = 0;

  function initClient() {
    if (typeof supabase === "undefined") {
      console.warn("[Supabase] 库未就绪，稍后重试");
      return;
    }
    try {
      window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      window.supabaseReady = true;
      console.log("[Supabase] 客户端初始化成功");
    } catch (e) {
      console.error("[Supabase] 初始化失败:", e);
    }
  }

  function tryLoad() {
    const script = document.createElement("script");
    script.src = CDN_SOURCES[currentIndex];
    script.async = false;

    script.onload = function() {
      console.log("[Supabase] 从 " + CDN_SOURCES[currentIndex] + " 加载成功");
      initClient();
    };

    script.onerror = function() {
      currentIndex++;
      if (currentIndex < CDN_SOURCES.length) {
        tryLoad();
      } else {
        console.error("[Supabase] 所有 CDN 加载失败，请检查网络或使用本地服务器运行");
        // 仍尝试初始化，可能 supabase 已通过其他方式加载
        initClient();
      }
    };

    document.head.appendChild(script);
  }

  tryLoad();
})();
