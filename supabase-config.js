// 由 supabase-loader.js 统一初始化客户端，此文件仅作兼容保留
// 若 loader 已创建 window.supabaseClient，此处不再重复创建
(function() {
  "use strict";
  if (window.supabaseClient) return;
  if (typeof supabase !== "undefined") {
    const SUPABASE_URL = "https://jlzneeyigkzhjmnpcsro.supabase.co";
    const SUPABASE_KEY = "sb_publishable_SbrJZV0ofP3NN8sKfMSxNw_ewfuaobn";
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
})();
