import {https, Request, Response} from 'firebase-functions';
import {Utils} from "./utils";
import * as request from "request"
import {createHmac} from "crypto";
import {stringify} from "querystring"
import {
    getBalance,
    enrichBalanceResult,
    formatBalanceResults,
    getOrders,
    enrichOrders,
    formatOrders, formatResults
} from "./bittrex-service"
const apiSign = (url : string)=>{
    const hash = createHmac('sha512', '<BITREX_SECERT_KEY>')
        .update(url)
        .digest('hex');
    return hash;
};
// Nounce is not enforced now so we just use a fixed nounce 123
const params = {
    apikey: '<BITREX_API_KEY>',
    nonce: 123
};
const options = {
    url: 'https://bittrex.com/api/v1.1/account/getbalances?'+ stringify(params),
    headers: {
        accept: 'application/json',
        apisign: apiSign('https://bittrex.com/api/v1.1/account/getbalances?'+ stringify(params))
    }
};

// Chat Id is your telegram chat ID
const sendMsgOptions = {
    url: 'https://api.telegram.org/<TELEGRAM_BOT_URL>/sendMessage',
    qs: {chat_id: 0, text : "test"},
    headers: {
        'User-Agent': 'request'
    }
};
export const getBittrexBalance = https.onRequest(async (req: Request, res: Response) => {
    const telegramMsg: TelegramMessageIncoming = req.body;
    if (telegramMsg.message.from.username !== Utils.userName
        && telegramMsg.message.chat.type !== Utils.privateString) {
        res.end();
    }
    console.log(telegramMsg.message.text);
    let initialAsyncArray = await Promise.all([getBalance(),  getOrders()]);
    let balanceResults : BitrexBalanceResult[] = initialAsyncArray[0];
    let openOrders: BittrexOpenOrder[] = initialAsyncArray[1];
    let enrichAsyncArray = await Promise.all([enrichBalanceResult(balanceResults),enrichOrders(openOrders)]);

    balanceResults = enrichAsyncArray[0];
    openOrders = enrichAsyncArray[1];

    const balanceString = formatBalanceResults(balanceResults);
    const orderString = formatOrders(openOrders);
    const msgString = balanceString + orderString;
    sendMsgOptions.qs.text = msgString;
    request.post(sendMsgOptions , (e, r, b)=>{
        console.log("DDONE");
        res.send("done");
    });


});
export const relayOrderDelta = https.onRequest(async (req: Request, res: Response) => {
    let orderDelta: OrderDelta = req.body;
    sendMsgOptions.qs.text = formatResults(orderDelta);
    request.post(sendMsgOptions , (e, r, b)=>{
        if(e){
            console.log(e);
        }
        console.log("DDONE");
        res.send("done");
    });
});


