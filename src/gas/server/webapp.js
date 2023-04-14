export let doGet = () => {
  const title = 'Google Apps Script';
  const fileName = 'gas_web.html';
  return HtmlService.createHtmlOutputFromFile(fileName)
    .setTitle(title)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
};
