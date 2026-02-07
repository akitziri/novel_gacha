const ITEMS_PER_PAGE = 10;
const STORAGE_KEY = "novel_gacha_history";

window.gachaHistory = window.gachaHistory || [];
window.isGachaRunning = false;
let currentPage = 1;

// ===== localStorage から復元 =====
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    gachaHistory = JSON.parse(saved);
  } catch {
    gachaHistory = [];
  }
}

// 最新ページを初期表示
currentPage = Math.max(1, Math.ceil(gachaHistory.length / ITEMS_PER_PAGE));

// 小説に自動ID付与
novels.forEach((novel, index) => {
  novel.id = `novel_${index + 1}`;
});

$(function () {

  // ===== ガチャ =====
  $("#gachaBtn").on("click", function () {
    if (isGachaRunning) return;

    isGachaRunning = true;
    $("#gachaBtn").prop("disabled", true);
    $("#gachaEffect").show();
    $(".history").addClass("disabled");

    let lastNovelId = gachaHistory.length
      ? gachaHistory[gachaHistory.length - 1].id
      : null;

    setTimeout(() => {
      let selected;
      do {
        selected = novels[Math.floor(Math.random() * novels.length)];
      } while (selected.id === lastNovelId && novels.length > 1);

      $("#resultTitle").text(selected.title);
      $("#resultBody").text(selected.body);
      $("#resultCard").hide().fadeIn(400)[0]
        .scrollIntoView({ behavior: "smooth" });

      gachaHistory.push(selected);

      // 保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gachaHistory));

      // 最新ページへ
      currentPage = Math.ceil(gachaHistory.length / ITEMS_PER_PAGE);
      renderHistory();

      $("#gachaEffect").hide();
      $("#gachaBtn").prop("disabled", false);
      $(".history").removeClass("disabled");
      isGachaRunning = false;

    }, 2000);
  });

  // ===== 履歴クリア =====
  $("#clearHistoryBtn").on("click", function () {
    gachaHistory = [];
    localStorage.removeItem(STORAGE_KEY);
    currentPage = 1;
    renderHistory();
    $("#resultCard").hide();
  });

  // ===== ページ切替 =====
  $("#prevPage").on("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderHistory();
    }
  });

  $("#nextPage").on("click", function () {
    const maxPage = Math.ceil(gachaHistory.length / ITEMS_PER_PAGE);
    if (currentPage < maxPage) {
      currentPage++;
      renderHistory();
    }
  });

  // 初期描画
  renderHistory();
});

// ===== 履歴描画 =====
function renderHistory() {
  const $list = $("#historyList");
  $list.empty();

  const total = gachaHistory.length;
  const maxPage = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;

  gachaHistory.slice(start, end).forEach((item, index) => {
    $("<li>")
      .text(`${start + index + 1}. ${item.title}`)
      .on("click", function () {
        if (isGachaRunning) return;

        $("#resultTitle").text(item.title);
        $("#resultBody").text(item.body);
        $("#resultCard").hide().fadeIn(200);
      })
      .appendTo($list);
  });

  // ページャー表示制御
  if (total > ITEMS_PER_PAGE) {
    $("#pager").show();
    $("#pageInfo").text(`${currentPage} / ${maxPage}`);
  } else {
    $("#pager").hide();
  }
}
