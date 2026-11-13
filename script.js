
const favoriteButtons = document.querySelectorAll(".favorite-btn");

const favoriteList = document.getElementById("favorite-list");
const favoriteEmpty = document.getElementById("favorite-empty");

// 保存されているお気に入りを読み込む
let favorites = JSON.parse(localStorage.getItem("astrosFavorites") || "[]");

// お気に入り一覧を更新する
function updateFavorites() {
  favoriteList.innerHTML = "";

  favorites.forEach(function(player) {
    const li = document.createElement("li");
    li.textContent = player;
    favoriteList.appendChild(li);
  });

  // 登録選手がいない場合のメッセージ
  favoriteEmpty.style.display =
    favorites.length === 0 ? "block" : "none";

  // ボタンの表示を変更する
  favoriteButtons.forEach(function(button) {
    const player = button.dataset.player;

    if (favorites.includes(player)) {
      button.textContent = "★ 登録解除";
    } else {
      button.textContent = "☆ お気に入り登録";
    }
  });
}

// お気に入りボタンを押したときの処理
favoriteButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    const player = button.dataset.player;

    if (favorites.includes(player)) {
      // 登録済みなら解除
      favorites = favorites.filter(function(name) {
        return name !== player;
      });
    } else {
      // 未登録なら追加
      favorites.push(player);
    }

    // ブラウザに保存
    localStorage.setItem("astrosFavorites", JSON.stringify(favorites));

    // 表示を更新
    updateFavorites();
  });
});

// ページを開いたときに一覧を表示
updateFavorites();
