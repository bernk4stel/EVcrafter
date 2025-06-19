
window.evExtension = window.evExtension || {};

window.evExtension.fetchAll = function (appID) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "GET_ALL", appID }, (response) => {
      if (!response) {
        reject(new Error("No response from background"));
      } else if (response.success) {
        resolve(response);
      } else {
        reject(new Error(response.error));
      }
    });
  });
};
