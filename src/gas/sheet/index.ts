/**
 * Opens a sidebar. The sidebar structure is described in the Sidebar.html
 * project file.
 */
import URLFetchRequest = GoogleAppsScript.URL_Fetch.URLFetchRequest;
// import {bufferCount, bufferTime, from, mergeMap, toArray} from "rxjs";
function writeToSheet(sheetName, data : any[]) {
    const headers : string[] = Object.keys(data[0]);
    const sheetData = [headers];
    for (const datum of data) {
        sheetData.push(headers.map((it) => datum[it]));
    }
    let spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = spreadSheet.getSheetByName(sheetName);
    if (!sheet) {
        sheet = spreadSheet.insertSheet(sheetName);
    }
    sheet.clearContents();

    const range =sheet.getRange(1, 1, sheetData.length, sheetData[0].length)
    range.getFilter()?.remove()
    range.setValues(sheetData);
    range.createFilter();
    for (const col in headers) {
        spreadSheet.setNamedRange(`${sheetName}.${headers[col]}`,sheet.getRange(2, parseInt(col)+1, sheetData.length-1, 1))
    }
}

interface MyCommonRequest {
    url: string
    body: any
}

function buildPostRequest(request: MyCommonRequest): URLFetchRequest {
    const builtRequest = UrlFetchApp.getRequest('https://api.ttdkapi.ttdk.com.vn' + request.url, {
        method: 'post',
        payload: JSON.stringify(request.body),
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': 'Bearer XXX',
        },
        muteHttpExceptions: false,
    })
    delete(builtRequest.headers['X-Forwarded-For'])
    console.log(builtRequest)
    return builtRequest
}

function fetchJson(request: MyCommonRequest) {
    return fetchAllJson([request])[0]
}

function fetchAllJson(requests: MyCommonRequest[]) {
    const responses = UrlFetchApp.fetchAll(requests.map(request => {
        return buildPostRequest(request)
    }));
    return responses.map((response) => {
        const json = response.getContentText();
        return JSON.parse(json)
    })
}

export function fetchArea() {
    const area = fetchJson({url: '/Stations/user/getAllStationArea', body: {}})

    writeToSheet("Area", area.data)
}

function getAreaValues() {
    return SpreadsheetApp.getActiveSpreadsheet().getRangeByName("Area.value").getDisplayValues().map(i => i[0])
}

export function fetchStations() {
    const rows = fetchAllJson(getAreaValues().map(area => {
        return {url: '/Stations/user/getAllExternal', body: {"filter":{"stationArea":area}}}
    })).map(it => {
        console.log(it.data.data[0])
        return it.data.data
    }).flat()
    writeToSheet("Station", rows)
}

function getStationIds() {
    return SpreadsheetApp.getActiveSpreadsheet().getRangeByName("Station.stationsId").getDisplayValues().map(i => i[0])
}

function getStationsByIds(allStationIds) {
    return fetchAllJson(allStationIds.map(stationId => {
        return {url: '/Stations/user/getListScheduleDate', body: {"stationsId":stationId,"startDate":"15/04/2023","endDate":"15/05/2023","vehicleType":1}}
    })).map((it, index) => {
        console.log(it.data[0])
        return it.data.map(it => {
            return {...it, stationId: allStationIds[index]}
        })
    }).flat()
}
export async function fetchSchedules() {
    // console.log('a')
    // const rows = new Promise<any[]>((resolve,reject) => {
    //     from(getStationIds().map(stationId => {
    //         console.log('c')
    //         return {url: '/Stations/user/getListScheduleDate', body: {"stationsId":stationId,"startDate":"15/04/2023","endDate":"15/05/2023","vehicleType":1}} as (MyCommonRequest)
    //     })).pipe(
    //         bufferCount(50),
    //         mergeMap((requests)=> {
    //             console.log('d')
    //             console.log(requests.length)
    //             return fetchAllJson(requests) as TtdkCommonResponse<any[]>[]
    //         }),
    //         mergeMap(it => {
    //             console.log('e')
    //             console.log(it.data[0])
    //             return it.data
    //         }),
    //         toArray()
    //     ).subscribe((it) => {
    //         console.log('f')
    //         console.log(it.length)
    //         resolve(it)
    //     })
    // })
    // console.log('b')
    const rows = []
    rows.push(...getStationIds().reduce((all,ele)=> {
        all.push(ele)
        if (all.length == 50) {
            rows.push(...getStationsByIds(all))
            all = []
        }
        return all
    },[]))

    writeToSheet("Schedule", await rows)

}