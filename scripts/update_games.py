
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

# Houston AstrosのチームID
TEAM_ID = 117

# games.jsonの保存先
OUTPUT = Path(__file__).resolve().parent.parent / "games.json"


def main():
    # 2026年シーズンの試合を取得
    start = "2026-03-01"
    end = "2026-11-01"

    # MLB Stats APIのURLを作成
    params = urllib.parse.urlencode({
        "sportId": 1,
        "teamId": TEAM_ID,
        "startDate": start,
        "endDate": end,
    })

    url = "https://statsapi.mlb.com/api/v1/schedule?" + params

    # MLBから試合データを取得
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "AstrosFanCommunity/1.0"}
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        data = json.load(response)

    games = []

    # 試合データを整理
    for day in data.get("dates", []):
        for game in day.get("games", []):
            teams = game["teams"]

            # Astrosがホームかアウェーか判定
            is_home = teams["home"]["team"]["id"] == TEAM_ID

            astros = teams["home"] if is_home else teams["away"]
            opponent = teams["away"] if is_home else teams["home"]

            # 試合状況
            status = game.get("status", {}).get(
                "detailedState", "不明"
            )

            # スコア
            astros_score = astros.get("score")
            opponent_score = opponent.get("score")

            games.append({
                "id": game["gamePk"],
                "date": game["gameDate"][:10],
                "opponent": opponent["team"]["name"],
                "homeAway": "home" if is_home else "away",
                "status": status,
                "astrosScore": astros_score,
                "opponentScore": opponent_score
            })

    # 日付順に並べる
    games.sort(key=lambda game: game["date"])

    # 保存するデータ
    result = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "MLB Stats API",
        "games": games
    }

    # games.jsonに保存
    OUTPUT.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )

    print(f"{len(games)}試合を保存しました")


if __name__ == "__main__":
    main()
