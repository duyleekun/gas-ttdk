import {fetchArea as localFetchArea} from './sheet';
import { fetchStations as localFetchStations } from './sheet';
import { fetchSchedules as localFetchSchedules } from './sheet';
import { saveAndTestLogin as localSaveAndTestLogin } from './sheet';
import { renewToken as localRenewToken } from './sheet';

const global = this;
global.fetchArea = localFetchArea;
global.fetchStations = localFetchStations;
global.fetchSchedules = localFetchSchedules;
global.saveAndTestLogin = localSaveAndTestLogin;
global.renewToken = localRenewToken;

// global.fetchArea = localFetchArea;

global.showHelp = () => {
  Browser.msgBox('Help me here');
};

global.onOpen = () => {
  try {
    SpreadsheetApp.getUi()
      .createMenu("LOLA")
      .addItem('Show sidebar', 'showSidebar')
      .addItem('fetchArea', 'fetchArea')
      .addItem('fetchStations', 'fetchStations')
      .addItem('fetchSchedules', 'fetchSchedules')
      .addItem('renewToken', 'renewToken')
      // .addItem('Help', 'showHelp')
      // .addSeparator()
      // .addItem('Credits', 'showCredits')
      .addToUi();
  } catch (f) {
    Logger.log(f.message);
  }
};

global.showSidebar = () => {
  const ui = HtmlService.createTemplateFromFile('vue_sidebar')
    .evaluate()
    .setTitle('TTDK')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(ui);
};
