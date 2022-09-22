const fs = require('fs');
const axios = require('axios');
const path = require('path');
const request = require('request');

const progress = require('request-progress');
const { resolve } = require('path');
const pre = '----';

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const downloadManager = function (url, dir, filename) {
    return new Promise(async (resolve) => {
        if (!fs.existsSync(`./${dir}`)) {
            fs.mkdirSync(`./${dir}`)
        }
        if (fs.existsSync(`./${dir}/${filename}`)) {
            console.log('download skipped')
            resolve()
        } else {
            progress(request(url), {
                throttle: 500
            }).on('progress', function (state) {
                process.stdout.write(pre + '' + (Math.round(state.percent * 100)) + "%");
            }).on('error', function (err) {
                console.log('error :( ' + err);
            }).on('end', function () {
                console.log(pre + '100% \n Download Completed');
                resolve()
            }).pipe(fs.createWriteStream(`./${dir}/${filename}`))
        }
    })
}


const getData = (offset = 0, limit = 50) => axios.post("https://emo6qjwy05.execute-api.ap-south-1.amazonaws.com/prod/apis/v3", {
    "type": "PRODUCT",
    "key": "A98FA6FCB86628991BB652BC48F9D",
    "offset": offset,
    "limit": limit,
    "companyId": "621de012c9e1660009eeeb6e",
    "status": "approved"
})

const doTheDownload = async (currentCount = 0, callback) => {

    console.log("doTheDownload = ", currentCount);

    let data = await getData(currentCount, 50).then(data => data);

    let totalCount = data.data.totalCount;
    let products = data.data.data;

    await asyncForEach(products, async (item) => {
        if (item.storeSubCategories && item.storeSubCategories[0]) {
            let detailView = "https://app.poly9.ai/public/" + item.detailView;
            let category = item.storeSubCategories[0].title;
            category = category.replace(new RegExp('/', 'g'), '_');
            category = category.replace(new RegExp(' ', 'g'), '');

            await downloadManager(detailView, `data/${category}`, `${item.uniqueCode}.png`);
        }
    })
    console.log(totalCount, "totalCount");

    if (totalCount > currentCount) {
        await doTheDownload((currentCount + 50), callback)
    } else {
        callback()
    }
}

async function downloadFiles() {

    doTheDownload(0, () => {
        console.log("Job Done");
    })

}

downloadFiles();





// const getData = (offset = 0, limit = 50) => axios.post("https://emo6qjwy05.execute-api.ap-south-1.amazonaws.com/prod/apis/v3", {
//     "type": "PRODUCT",
//     "key": "A98FA6FCB86628991BB652BC48F9D",
//     "offset": offset,
//     "limit": limit,
//     "companyId": "621de012c9e1660009eeeb6e",
//     "status": "approved"
// })

// const doTheDownload = async (currentCount = 0, callback) => {

//     console.log("doTheDownload = ", currentCount);

//     let data = await getData(currentCount, 50).then(data => data);
//     console.log(data, "data");

//     let totalCount = data.data.totalCount;
//     let products = data.data;

//     await asyncForEach(products, async (item) => {
//         if (item.storeSubCategories && item.storeSubCategories[0]) {
//             let detailView = "https://app.poly9.ai/public/" + item.detailView;
//             let category = item.storeSubCategories[0].title;
//             category = category.replace(new RegExp('/', 'g'), '_');
//             category = category.replace(new RegExp(' ', 'g'), '');

//             await downloadManager(detailView, `data/${category}`, `${item.uniqueCode}.png`);
//         }
//     })
//     console.log(totalCount, "totalCount");

//     if (totalCount > currentCount) {
//         await doTheDownload((currentCount + 50), callback)
//     } else {
//         callback()
//     }
// }
































// const request2 = axios.post("https://emo6qjwy05.execute-api.ap-south-1.amazonaws.com/prod/apis/v3", {
//     "type": "PRODUCT",
//     "key": "A98FA6FCB86628991BB652BC48F9D",
//     "offset": 0,
//     "limit": 50,
//     "companyId": "621de012c9e1660009eeeb6e",
//     "status": "approved"
// }).then((result) => {
//     let products = result.data.data;
//     // console.log(result.data.data, "subcategory");

//     await asyncForEach(async (item) => {
//         if (item.storeSubCategories && item.storeSubCategories[0]) {
//             let detailView = "https://app.poly9.ai/public/" + item.detailView;
//             let category = item.storeSubCategories[0].title;
//             category = category.replace(new RegExp('/', 'g'), '_');
//             category = category.replace(new RegExp(' ', 'g'), '');

//             downloadManager(detailView, `data/${category}`, `${item.uniqueCode}.png`);
//         }
//     })

// }).catch((e) => {
//     console.log(e, "Error")
//     // console.log("Error")
// })



