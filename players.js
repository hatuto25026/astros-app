
const roster = document.getElementById("roster");

const searchInput = document.getElementById("player-search");
const searchCount = document.getElementById("search-count");

const groups = [
  "投手",
  "捕手",
  "内野手",
  "外野手",
  "指名打者"
];

// 全選手データを保存する
let allPlayers = [];

// お気に入り選手を読み込む
let favorites = [];

try {
  favorites = JSON.parse(
    localStorage.getItem("astrosFavorites") || "[]"
  );

  if (!Array.isArray(favorites)) {
    favorites = [];
  }
} catch {
  favorites = [];
}

// お気に入り情報を保存する
function saveFavorites() {
  localStorage.setItem(
    "astrosFavorites",
    JSON.stringify(favorites)
  );
}

// HTML要素を作成する
function make(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

// お気に入り一覧を表示する
function renderFavorites() {
  const list = document.getElementById("favorite-list");
  const empty = document.getElementById("favorite-empty");

  list.replaceChildren();

  favorites.forEach(name => {
    list.append(make("li", name));
  });

  empty.hidden = favorites.length > 0;
}

// 選手一覧を表示する
function createRoster(players) {
  roster.replaceChildren();

  // 検索結果の人数を表示
  if (searchCount) {
    searchCount.textContent =
      players.length + "人の選手が見つかりました";
  }

  // 検索結果が0人の場合
  if (players.length === 0) {
    roster.append(
      make("p", "該当する選手が見つかりませんでした。")
    );

    renderFavorites();
    return;
  }

  // ポジション別に表示
  groups.forEach(group => {
    const groupPlayers = players.filter(
      player => player.group === group
    );

    if (groupPlayers.length === 0) {
      return;
    }

    // グループ名
    roster.append(make("h2", group));

    const container = make("div", "");
    container.className = "player-container";

    // 選手カードを作成
    groupPlayers.forEach(player => {
      const card = make("article", "");
      card.className = "player-card";

      // 選手情報
      card.append(
        make("h3", player.name),
        make(
          "p",
          "背番号：" + (player.number ?? "—")
        ),
        make(
          "p",
          "ポジション：" + (player.position || "—")
        )
      );

      // お気に入りボタン
      const button = make("button", "");

      function refreshButton() {
        button.textContent = favorites.includes(player.name)
          ? "★ 登録解除"
          : "☆ お気に入り登録";
      }

      button.addEventListener("click", () => {
        if (favorites.includes(player.name)) {
          favorites = favorites.filter(
            name => name !== player.name
          );
        } else {
          favorites.push(player.name);
        }

        saveFavorites();
        refreshButton();
        renderFavorites();
      });

      refreshButton();

      card.append(button);
      container.append(card);
    });

    roster.append(container);
  });

  renderFavorites();
}

// 選手名で検索する
function searchPlayers() {
  const keyword = searchInput.value
    .trim()
    .toLowerCase();

  // 入力された文字を含む選手を探す
  const filteredPlayers = allPlayers.filter(player =>
    player.name.toLowerCase().includes(keyword)
  );

  // 検索結果を表示
  createRoster(filteredPlayers);
}

// 検索欄に文字が入力されたとき
if (searchInput) {
  searchInput.addEventListener("input", searchPlayers);
}

// players.jsonから選手データを読み込む
fetch("players.json", { cache: "no-store" })
  .then(response => {
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data.players)) {
      throw new Error("Invalid players");
    }

    // 全選手データを保存
    allPlayers = data.players;

    // 最初に全選手を表示
    createRoster(allPlayers);
  })
  .catch(error => {
    console.error(error);

    roster.textContent =
      "選手データを読み込めません。GitHub Pagesで確認してください。";

    if (searchCount) {
      searchCount.textContent = "";
    }
  });
