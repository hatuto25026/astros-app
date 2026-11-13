
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://www.thesportsdb.com/api/v1/json/123"
OUTPUT = Path(__file__).resolve().parent.parent / "players.json"


# APIからJSONデータを取得する
def get_json(url):
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "AstrosFanCommunity/1.0"}
    )

    with urllib.request.urlopen(request, timeout=20) as response:
        return json.load(response)


# AstrosのチームIDを取得する（修正）
def get_astros_team_id():
    url = BASE + "/searchteams.php?t=Houston%20Astros"

    data = get_json(url)

    for team in data.get("teams") or []:
        if team.get("strTeam") == "Houston Astros":
            return team["idTeam"]

    raise RuntimeError(
        "AstrosのチームIDを取得できませんでした"
    )


# ポジションを日本語のグループに分類する
def get_group(position):
    position = (position or "").lower()

    if "pitch" in position:
        return "投手"

    if "catch" in position:
        return "捕手"

    if "designated" in position:
        return "指名打者"

    if "outfield" in position or "fielder" in position:
        return "外野手"

    if any(word in position for word in [
        "base",
        "shortstop",
        "infield"
    ]):
        return "内野手"

    return "その他"


# 選手データを取得して保存する
def main():

    # AstrosのチームIDを取得
    team_id = get_astros_team_id()

    print("Astros Team ID:", team_id)

    # チームに所属する選手を取得
    data = get_json(
        BASE + "/lookup_all_players.php?id=" + str(team_id)
    )

    raw_players = data.get("player") or []

    # 取得人数が少ない場合は更新しない
    if len(raw_players) < 5:
        raise RuntimeError(
            "取得人数が少ないため更新を中止しました"
        )

    players = []

    # 選手データを整理
    for p in raw_players:

        name = p.get("strPlayer")

        if not name:
            continue

        # 背番号
        number = p.get("strNumber")

        if number and str(number).isdigit():
            number = int(number)
        else:
            number = None

        # ポジション
        position = p.get("strPosition") or "不明"

        players.append({
            "id": p.get("idPlayer"),
            "name": name,
            "number": number,
            "position": position,
            "group": get_group(position)
        })

    # データが不足している場合は保存しない
    if len(players) < 5:
        raise RuntimeError(
            "有効な選手データが不足しています"
        )

    # 保存するデータ
    result = {
        "updatedAt": datetime.now(
            timezone.utc
        ).strftime("%Y-%m-%d"),
        "source": "TheSportsDB",
        "players": players
    }

    # players.jsonを更新
    OUTPUT.write_text(
        json.dumps(
            result,
            ensure_ascii=False,
            indent=2
        ) + "\n",
        encoding="utf-8"
    )

    print(
        f"{len(players)}人の選手情報を保存しました"
    )


# プログラムを実行
if __name__ == "__main__":
    main()
