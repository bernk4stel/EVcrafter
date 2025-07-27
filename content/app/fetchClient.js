
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

window.evExtension.getCachedHashes = function (appID, itemClassTag) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "GET_HASHES", appID, itemClassTag }, (response) => {
        if (!response) {
          reject(new Error("No response"));
        }
        else { 
          response.success ? resolve(response.hashes) : reject(new Error(response.error));
        }
      }
    );
  });
}