const request = require('request');
const fs = require('fs');
const fastcsv = require('fast-csv');
const ws = fs.createWriteStream("out.csv");

function executeAPI(cleanedURL, e, name) {
    return new Promise((resolved) => {
        request(cleanedURL, (err, res, bod) => {
            var data = []
            console.error('error:', err);
            console.log('statusCode:', res && res.statusCode);
            var jsonServer = JSON.parse(bod)
            var charts = jsonServer["charts"]
            var all = charts["all"] // all, pvp, pve
    
            var dateArray = all["labels"]
            var allianceArray = all["datasets"][0] 
            var hordeArray = all["datasets"][1] 
            
            data.push(name[e]["name"])
            for(i = 0; i < dateArray.length; i++)
            {
                if(!headers.includes(dateArray[i]))
                {
                    headers.push(dateArray[i])
                }
                data.push(hordeArray["data"][i] + allianceArray["data"][i])
            }
            rows.push(data)
            resolved()
        })
    })
}

var rows = []
var headers = ["realm"]
request('https://ironforge.pro/api/servers?timeframe=TBC', function (error, response, body) {
    console.error('error:', error);
    console.log('statusCode:', response && response.statusCode);
    var serverJSON = JSON.parse(body)
    var serverJSONValues = serverJSON["values"]
    var name = serverJSONValues
    let promises = []

    for(var e = 0; e < name.length - 1; e++)
    {
        serverURL = "https://ironforge.pro/api/server/tbc/" + name[e]["name"]
        var cleanedURL = encodeURI(serverURL)
        promises.push(executeAPI(cleanedURL, e, name))
    }

    Promise.all(promises)
    .then(() => {
        rows.unshift(headers)

        console.log(rows)

       fastcsv
       .write(rows, { headers: true })
       .pipe(ws);

        console.log("done")
        }).catch(err => console.log(err));
});

