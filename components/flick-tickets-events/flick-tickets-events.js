const selectedLanguages = new Set();

    function filterMovies(language) {
      const movies = document.querySelectorAll(".movie-button");

      // Toggle selection of the language button
      if (selectedLanguages.has(language)) {
        selectedLanguages.delete(language); // Deselect if already selected
        document.querySelector(.filter-button[data-language="${language}"]).classList.remove('active');
      } else {
        selectedLanguages.add(language); // Select if not selected
        document.querySelector(.filter-button[data-language="${language}"]).classList.add('active');
      }

      // Show all movies if no language is selected, otherwise filter by selected languages
      movies.forEach(movie => {
        const movieLanguage = movie.getAttribute("data-language");
        movie.style.display = (selectedLanguages.size === 0 || selectedLanguages.has(movieLanguage)) ? "block" : "none";
      });
    }