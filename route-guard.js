document.addEventListener("DOMContentLoaded", async () => {
  const sb = window.supabaseClient;
  if (!sb) return;

  const { data: { user } } = await sb.auth.getUser();
  const currentPage = document.body.getAttribute("data-page");

  if (currentPage === "home" && !user) {
    window.location.href = "login.html";
  } else if (currentPage === "login" && user) {
    window.location.href = "index.html";
  }
});
