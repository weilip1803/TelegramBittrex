import {stringify} from "querystring";
import {createHmac} from "crypto";
import * as request from "request"

function apiSign(url : string){
    const hash = createHmac('sha512', '<BITTREX_API_SECRET>')
        .update(url)
        .digest('hex');
    return hash;
}
//Nonce not used currently just any random value will do
const params = {
    apikey: '<BITTREX_API_KEY>',
    nonce: 123
};
//Functions
export async function getBalance(): Promise<BitrexBalanceResult[]> {
    const url = 'https://bittrex.com/api/v1.1/account/getbalances?'+ stringify(params);
    const options = {
        url: url,
        headers: {
            accept: 'application/json',
            apisign: apiSign(url)
        }
    };
    return new Promise<BitrexBalanceResult[]>(function(resolve, reject) {        // Do async job
        request.get(options, function(err, resp, body : string) {
            if (err) {
                reject(err);
            } else {
                const balancesMsg : BitrexGetBalancesMessage = JSON.parse(body);
                let balanceResults: BitrexBalanceResult[] = balancesMsg.result;

                balanceResults =   balanceResults.filter(balanceResult => balanceResult.Balance > 0.01);
                resolve(balanceResults);
            }
        })
    })
}
export function formatBalanceResults(balanceResults: BitrexBalanceResult[]): string{
    let msgString = 'Balance\n';
    let totalBtc = 0;
    let totalValue = 0;
    for(const balanceResult of balanceResults){
        totalBtc +=balanceResult.btcEstimate;
        totalValue += balanceResult.valueEstimate;

    }
    for(const balanceResult of balanceResults){
        console.log("confused");
        console.log(balanceResult);
        console.log(balanceResult.price);
        const percent = (balanceResult.btcEstimate/totalBtc) *100;
        const rowString: string = `[${balanceResult.Currency}]:\n\
        Balance:${balanceResult.Balance.toFixed(4)}\n\
        ethPrice:${balanceResult.ethPrice.toFixed(5)}\n\
        price:$${balanceResult.price.toFixed(5)}\n\
        BtcEstimate:${balanceResult.btcEstimate.toFixed(4)}\n\
        ValueEstimate:${balanceResult.valueEstimate.toFixed(2)}\n\
        percent:${percent.toFixed(2)}%\n`;
        msgString += rowString
    }
    msgString += `Total Btc:${totalBtc.toFixed(4)}\n`;
    msgString += `Total Value:${totalValue.toFixed(2)}\n`;
    return msgString;

}
export async function enrichBalanceResult(balanceResults: BitrexBalanceResult[]) {
    console.log(balanceResults);
    const usdBtcTicker: Promise<BittrexTicker> = getTicker("USD-BTC");
    const usdEthTicker: Promise<BittrexTicker> = getTicker("USD-ETH");
    const promiseMap = [];
    const tickerMap = {};
    promiseMap.push(usdBtcTicker);
    promiseMap.push(usdEthTicker);
    for(const balanceResult of balanceResults){
        switch(balanceResult.Currency) {
            case 'USDT': {
                // balanceResults[i].btcEstimate = balanceResults[i].Balance / usdBtcTicker.result.Bid;
                break;
            }
            case 'USD': {
                // balanceResults[i].btcEstimate = balanceResults[i].Balance / usdBtcTicker.result.Bid;
                break;
            }
            case 'BTC':{
                break
            }
            default: {
                const ticker = 'BTC-' + balanceResult.Currency;
                tickerMap[balanceResult.Currency] = promiseMap.length;
                promiseMap.push(getTicker(ticker));
                break;
            }
        }
    }
    const tickers: BittrexTicker[] = await Promise.all(promiseMap);
    for(const balanceResult of balanceResults){
        switch(balanceResult.Currency) {
            case 'USDT': {
                balanceResult.btcEstimate = balanceResult.Balance / tickers[0].result.Bid;
                balanceResult.valueEstimate = balanceResult.Balance;
                balanceResult.price = balanceResult.valueEstimate/balanceResult.Balance;
                balanceResult.ethPrice = balanceResult.price/tickers[1].result.Bid;
                break;
            }
            case 'USD': {
                balanceResult.valueEstimate = balanceResult.Balance;
                balanceResult.btcEstimate = balanceResult.Balance / tickers[0].result.Bid;
                balanceResult.price = balanceResult.valueEstimate/balanceResult.Balance;
                balanceResult.ethPrice = balanceResult.price/tickers[1].result.Bid;
                break;
            }
            case 'BTC':{
                balanceResult.btcEstimate = balanceResult.Balance;
                balanceResult.valueEstimate = balanceResult.Balance * tickers[0].result.Bid;
                balanceResult.price = balanceResult.valueEstimate/balanceResult.Balance;
                balanceResult.ethPrice = balanceResult.price/tickers[1].result.Bid;
                break;
            }
            default: {
                const index : number = tickerMap[balanceResult.Currency];
                balanceResult.btcEstimate = balanceResult.Balance * tickers[index].result.Bid;

                balanceResult.valueEstimate = balanceResult.btcEstimate * tickers[0].result.Bid;
                balanceResult.price = balanceResult.valueEstimate/balanceResult.Balance;
                balanceResult.ethPrice = balanceResult.price/tickers[1].result.Bid;
                break;
            }
        }
    }
    return balanceResults;
}
export async function getOrders(): Promise<BittrexOpenOrder[]> {
    const url = 'https://bittrex.com/api/v1.1/market/getopenorders?'+ stringify(params);
    const options = {
        url: url,
        headers: {
            accept: 'application/json',
            apisign: apiSign(url)
        }
    };
    return new Promise<BittrexOpenOrder[]>(function(resolve, reject) {        // Do async job
        request.get(options, function(err, resp, body : string) {
            if (err) {
                reject(err);
            } else {
                console.log(body)
                const ordersMsg : BittrexOpenOrders = JSON.parse(body);
                const orderResults: BittrexOpenOrder[] = ordersMsg.result;

                resolve(orderResults);
            }
        })
    })
}

export async function enrichOrders(openOrders :  BittrexOpenOrder[]) {
    console.log(openOrders);
    const promiseArray: Promise<BittrexTicker>[] = [];
    for(const openOrder of openOrders){
        promiseArray.push(getTicker(openOrder.Exchange));
    }
    const tickers: BittrexTicker[] = await Promise.all(promiseArray);
    for(let i = 0; i < openOrders.length; i++){
        openOrders[i].currentBid = tickers[i].result.Bid;
        openOrders[i].currentAsk = tickers[i].result.Ask;
    }
    return openOrders;
}
export function formatOrders(openOrders:  BittrexOpenOrder[]){
    let msgString = '\n**OpenOrders**\n';
    for(const openOrder of openOrders){
        const total = openOrder.Limit * openOrder.Quantity;
        const rowString: string = `[${openOrder.Exchange}]:\n\
        OrderType:${openOrder.OrderType}\n\
        OpenDate:${openOrder.Opened.slice(0, -4)}\n\
        Quantity:${openOrder.Quantity.toFixed(5)}\n\
        QuantityRemaining:${openOrder.QuantityRemaining.toFixed(5)}\n\
        Limit:$${openOrder.Limit.toFixed(6)}\n\
        CurrentBid:${openOrder.currentBid.toFixed(6)}\n\
        CurrentAsk:${openOrder.currentAsk.toFixed(6)}\n\
        Total:${total.toFixed(6)}\n`;
        msgString += rowString
    }
    return msgString;
}

async function getTicker(ticker: string): Promise<BittrexTicker>{
    const url = 'https://bittrex.com/api/v1.1/public/getticker?market=' + ticker;
    return new Promise<BittrexTicker>(function(resolve, reject) {
        request(url,(err, resp, body : string)=>{
            if(err){
                reject(err);
                return;
            }
            const tickerMsg:BittrexTicker = JSON.parse(body);
            resolve(tickerMsg);
        })
    });
}
export function formatResults(orderDelta: OrderDelta): string{
    var array = orderDelta.E.split('-');
    const units = Number(orderDelta.Q) * Number(orderDelta.X);
    const openedDate = new Date(Number(orderDelta.Y));
    let closedDateStr;
    if(orderDelta.C){
        let closedDate = new Date(Number(orderDelta.C));
        closedDateStr = openedDate.toISOString().slice(0, -8)
    }else{
        closedDateStr = 'Not Closed'
    }

    let msgString = `\n**OrderDelta**\n[${orderDelta.E}]:\n\
        OrderType:${orderDelta.OT}\n\
        Quantity(${array[1]}):${Number(orderDelta.Q).toFixed(5)}\n\
        QuantityLeft(${array[1]}):${Number(orderDelta.q).toFixed(5)}\n\
        Units:${units.toFixed(5)} of ${array[0]}\n\
        Limit:${Number(orderDelta.X).toFixed(6)}\n\
        OpenDate:${openedDate.toISOString().slice(0, -8)}\n\
        CloseDate:${closedDateStr}\n\
        IsCanceled:${orderDelta.CI}\n`;
    

    return msgString;
}

