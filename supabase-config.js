(function () {
  "use strict";
  const SUPABASE_URL = "https://jlzneeyigkzhjmnpcsro.supabase.co";
  const SUPABASE_KEY = "sb_publishable_SbrJZV0ofP3NN8sKfMSxNw_ewfuaobn";
  if (typeof supabase !== "undefined") {
    const { createClient } = supabase;
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
})();
