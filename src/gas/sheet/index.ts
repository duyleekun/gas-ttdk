/**
 * Opens a sidebar. The sidebar structure is described in the Sidebar.html
 * project file.
 */
import URLFetchRequest = GoogleAppsScript.URL_Fetch.URLFetchRequest;
// import {bufferCount, bufferTime, from, mergeMap, toArray} from "rxjs";
function writeToSheet(sheetName, data: any[]) {
    const headers: string[] = Object.keys(data[0]);
    const sheetData = [headers];
    for (const datum of data) {
        if (datum)
            sheetData.push(headers.map((it) => datum[it]));
    }
    let spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = spreadSheet.getSheetByName(sheetName);
    if (!sheet) {
        sheet = spreadSheet.insertSheet(sheetName);
    }
    sheet.clearContents();

    const range = sheet.getRange(1, 1, sheetData.length, sheetData[0].length)
    range.getFilter()?.remove()
    range.setValues(sheetData);
    range.createFilter();
    for (const col in headers) {
        spreadSheet.setNamedRange(`${sheetName}.${headers[col]}`, sheet.getRange(2, parseInt(col) + 1, sheetData.length - 1, 1))
    }
}

interface MyCommonRequest {
    url: string
    body: any
    headers?: any
}

function buildPostRequest(request: MyCommonRequest): URLFetchRequest {
    const headers = {
        'Content-Type': 'application/json;charset=utf-8',
        ...request.headers
    }

    const {accessToken} = PropertiesService.getDocumentProperties().getProperties()
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
    }

    const builtRequest = UrlFetchApp.getRequest('https://api.ttdkapi.ttdk.com.vn' + request.url, {
        method: 'post',
        payload: JSON.stringify(request.body),
        headers: headers,
        muteHttpExceptions: false,
    })
    delete (builtRequest.headers['X-Forwarded-For'])
    // console.log(builtRequest)
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

export function saveAndTestLogin(username, password) {
    console.log('saveAndTestLogin', username)
    const documentProperties = PropertiesService.getDocumentProperties();
    documentProperties.deleteAllProperties()
    documentProperties.setProperties({username, password})
    renewToken()
}

export function renewToken() {
    const documentProperties = PropertiesService.getDocumentProperties()
    const {username, password} = documentProperties.getProperties()
    console.log('renewToken', username)
    const {data: {token}} = fetchJson({body: {phoneNumber: username, password}, url: '/AppUsers/loginUserByPhone'})
    documentProperties.setProperties({accessToken: token})
}


export function fetchStations() {
    const rows = fetchAllJson(getAreaValues().map(area => {
        return {url: '/Stations/user/getAllExternal', body: {"filter": {"stationArea": area}}}
    })).map(it => {
        // console.log(it.data.data[0])
        return it.data.data
    }).flat()
    writeToSheet("Station", rows)
}

function getStationIds() {
    return SpreadsheetApp.getActiveSpreadsheet().getRangeByName("Station.stationsId").getDisplayValues().map(i => i[0])
}

interface StationResponse {
    stationsId: string
    stationCode: string
    stationArea: string

    stationStatus: string
}

function getStations(fields: string[]) {
    const fieldValuesMap = fields.reduce((all, field) => {
        all[field] = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(`Station.${field}`).getDisplayValues().map(i => i[0])
        return all
    }, {} as { [a in string]: string[] })
    const stations = [] as StationResponse[]
    fieldValuesMap[fields[0]].forEach((_, index) => {
        const station = fields.reduce((all, field) => {
            all[field] = fieldValuesMap[field][index]
            return all
        }, {} as StationResponse)
        stations.push(station)
    })
    return stations;
}

function getSchedulesByStationIds(allStationIds, vehicleType) {
    return fetchAllJson(allStationIds.map(stationId => {
        return {
            url: '/Stations/user/getListScheduleDate',
            body: {"stationsId": stationId, "startDate": "15/04/2023", "endDate": "15/07/2023", vehicleType}
        }
    })).map((it, index) => {
        // console.log(it.data[0])
        return it.data.map(it => {
            return {...it, stationId: allStationIds[index], vehicleType}
        })
    }).flat()
}

function getSchedulesByStations(allStations: StationResponse[], vehicleType) {
    return fetchAllJson(allStations.map(({stationsId}) => {
        return {
            url: '/Stations/user/getListScheduleDate',
            body: {stationsId, "startDate":  (new Date()).toLocaleDateString("vi"), "endDate": (new Date(Date.now()+1000*60*60*24*60)).toLocaleDateString("vi"), vehicleType}
        }
    })).map((it, index) => {
        // console.log(it.data[0])
        return it.data.map(it => {
            const {stationsId, stationArea, stationCode, stationStatus} = allStations[index]
            return {...it, stationId: stationsId, vehicleType, stationArea, stationCode, stationStatus}
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
    rows.push(...getStations(['stationsId', 'stationCode', 'stationArea', 'stationStatus']).reduce((all, ele) => {
        all.push(ele)
        if (all.length == 25) {
            rows.push(...getSchedulesByStations(all, "1"))
            rows.push(...getSchedulesByStations(all, "10"))
            rows.push(...getSchedulesByStations(all, "20"))
            all = []
        }
        return all
    }, [] as StationResponse[]))

    writeToSheet("Schedule", rows)

}
