document.getElementById("blockBtn").addEventListener("click", function () {
  let url = document.getElementById("url").value.trim();
  if (!url) return;

  // Lấy danh sách rule hiện tại từ Chrome Storage
  chrome.storage.sync.get({ blockedSites: [] }, function (data) {
    let blockedSites = data.blockedSites;
    if (!blockedSites.includes(url)) {
      blockedSites.push(url);
      chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
        updateBlockingRules(blockedSites);
        displayBlockedSites();
      });
    }
  });
});

// Cập nhật rule trong Chrome Extension
function updateBlockingRules(blockedSites) {
  let rules = blockedSites.map((site, index) => ({
    id: index + 1, // ID phải duy nhất
    priority: 1,
    action: {
      type: "redirect",
      redirect: { url: "https://www.google.com/" },
    },
    condition: {
      urlFilter: `*${site}*`,
      resourceTypes: ["main_frame"],
    },
  }));

  // Xóa tất cả rule cũ trước khi cập nhật
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    let ruleIds = existingRules.map((rule) => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds,
      addRules: rules,
    });
  });
}

// Hiển thị danh sách đã chặn
function displayBlockedSites() {
  chrome.storage.sync.get({ blockedSites: [] }, function (data) {
    let list = document.getElementById("blockedList");
    list.innerHTML = "";
    data.blockedSites.forEach((site) => {
      let li = document.createElement("li");
      li.textContent = site;
      list.appendChild(li);
    });
  });
}

document.addEventListener("DOMContentLoaded", displayBlockedSites);
