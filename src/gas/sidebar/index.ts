/**
 * Opens a sidebar. The sidebar structure is described in the Sidebar.html
 * project file.
 */

function writeToSheet(sheetName, data) {
    const headers = ['id', 'key', 'name', 'shortDesc'];
    const sheetData = [headers];
    for (const datum of data) {
        const row = [datum.id, datum.key, datum.name, datum.shortDesc];
        sheetData.push(row);
    }
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
    }
    sheet.clearContents();
    sheet.getRange(1, 1, sheetData.length, sheetData[0].length).setValues(sheetData);
}

function fetchJson(url) {
    const response = UrlFetchApp.fetch(url, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        },
        muteHttpExceptions: false,
    });
    const json = response.getContentText();
    const data = JSON.parse(json);
    return data

}

export function writeRune() {
    const axios = require('axios');
    const fs = require('fs');
    const responseVersion = fetchJson('https://ddragon.leagueoflegends.com/api/versions.json')
    const response: [{ id: number, name: string, key: string, slots: [{ runes: [{ id: number, name: string, key: string, shortDesc: string }] }] }] = fetchJson(`https://ddragon.leagueoflegends.com/cdn/${responseVersion.data[0]}/data/en_US/runesReforged.json`)

    writeToSheet("Lol", response.reduce((all, ele) => {
        all.push({id: ele.id, name: ele.name})
        ele.slots.forEach((ele1) => {
            all.push(...ele1.runes)
        })
        return all
    }, []))
}
