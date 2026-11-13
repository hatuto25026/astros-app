
const gamesList = document.getElementById("games-list");

fetch("games.json", { cache: "no-store" })
  .then(response => {
    if (!response.ok) {
      throw new Error("試合データの取得に失敗しました");
    }

    return response.json();
  })
  .then(data => {
    gamesList.replaceChildren();

    data.games.forEach(game => {
      const card = document.createElement("article");
      card.className = "panel";

      const title = document.createElement("h3");
      title.textContent =
        game.date + " vs " + game.opponent;

      const location = document.createElement("p");
      location.textContent =
        game.homeAway === "home" ? "ホーム" : "アウェー";

      const result = document.createElement("p");

      if (
        game.astrosScore !== null &&
        game.opponentScore !== null
      ) {
        result.textContent =
          "Astros " + game.astrosScore +
          " - " + game.opponentScore +
          " " + game.opponent;
      } else {
        result.textContent = "スコア未確定";
      }

      const status = document.createElement("p");
      status.textContent = game.status;

      card.append(title, location, result, status);
      gamesList.append(card);
    });
  })
  .catch(error => {
    console.error(error);
    gamesList.textContent =
      "試合データを読み込めませんでした。";
  });
