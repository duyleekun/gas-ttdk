import { getGmailAliases as localGetGmailAliases, getGmailLabels as localGetGmailLabels } from './gmail';
import { sendmail as localSendMail } from './server/mail';
import { doGet as localDoGet } from './server/webapp';
import { writeRune as localWriteRune } from './sidebar';

const global = this;
global.sendmail = localSendMail;

global.doGet = localDoGet;

global.getGmailLabels = localGetGmailLabels;
global.getGmailAliases = localGetGmailAliases;
global.writeRune = localWriteRune;

global.showHelp = () => {
  Browser.msgBox('Help me here');
};

global.onOpen = () => {
  try {
    SpreadsheetApp.getUi()
      .createMenu("LOLA")
      .addItem('Show sidebar', 'showSidebar')
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
    .setTitle('LOLA')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showSidebar(ui);
};
