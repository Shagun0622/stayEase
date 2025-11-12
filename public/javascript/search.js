document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const suggestionsBox = document.getElementById("suggestions");

  let timeout = null;

  searchInput.addEventListener("input", async function () {
    const query = this.value.trim();
    clearTimeout(timeout);

    if (!query) {
      suggestionsBox.style.display = "none";
      return;
    }

    // Wait 300ms before sending a request (for better UX)
    timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/listings/suggest?q=${encodeURIComponent(query)}`);
        const suggestions = await res.json();

        suggestionsBox.innerHTML = "";

        if (suggestions.length === 0) {
          suggestionsBox.style.display = "none";
          return;
        }

        suggestions.forEach((s) => {
          const item = document.createElement("li");
          item.classList.add("list-group-item", "list-group-item-action");
          item.style.cursor = "pointer";
          item.textContent = `${s.title} — ${s.location || s.country}`;
          
          // 🖱️ Click suggestion → fill input & submit
          item.addEventListener("click", () => {
            searchInput.value = s.title;
            document.getElementById("searchForm").submit();
          });

          suggestionsBox.appendChild(item);
        });

        suggestionsBox.style.display = "block";
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    }, 300);
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
      suggestionsBox.style.display = "none";
    }
  });
});