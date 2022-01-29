const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

async function initScrapper() {
    try {
        const url = "https://coinmarketcap.com/";

        const { data } = await axios({
            method: "GET",
            url: url,
        });

        const $ = cheerio.load(data);

        const elementSelector = "#__next > div > div.main-content > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div:nth-child(1) > div.h7vnx2-1.bFzXgL > table > tbody > tr"

        const keys = [
            'rank',
            'name',
            'price',
            '24h',
            '7d',
            'marketCap',
            'volume',
            'circulatingSuply'
        ];

        const cryptoArray = [];
        
        $(elementSelector).each((parentIndex, parentElement) => {
            let keyIndex = 0;
            const cryptoObject = {};

            if (parentIndex <= 9) {
                $(parentElement).children().each((childIndex, childElement) => {
                    let tdValue =  $(childElement).text();
                    
                    if (keyIndex === 1 || keyIndex === 6) {
                        tdValue = $('p:first-child', $(childElement).html()).text();
                    }
                    
                    if (tdValue) {
                        cryptoObject[keys[keyIndex]] = tdValue;
                        
                        keyIndex ++;
                    }
                });
                
                cryptoArray.push(cryptoObject);
            }
        });

        return cryptoArray;
        
    } catch (error) {
        console.log(error);
    }
}

//initScrapper();

const app = express();

app.get('/api/', async (req, res) => {
    try {
        const cryptoPrices = await initScrapper();
        
        return res.status(200).json({
            result: cryptoPrices,
        });
    } catch (error) {
        return res.status(500).json({
            error: error.toString(),
        })
    }
});

app.listen(5000, () => {
    console.log("running on port 5000");
});