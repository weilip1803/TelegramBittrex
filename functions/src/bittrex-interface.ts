interface BitrexGetBalancesMessage {
    success: number
    message: string
    result: BitrexBalanceResult[]
}

interface BitrexBalanceResult {
    "Currency": string,
    "Balance": number,
    "Available": number,
    "Pending": number,
    "CryptoAddress": string,
    "Requested": boolean,
    "Uuid": string,
    "ethPrice": number,
    "price": number,
    "btcEstimate": number,
    "valueEstimate": number
}

interface BittrexTicker {
    "success": boolean,
    "message": string,
    "result": {
        "Bid": number,
        "Ask": number,
        "Last": number
    }
}

interface BittrexOpenOrders {
    "success": boolean,
    "message": string,
    "result": BittrexOpenOrder[]
}

interface BittrexOpenOrder {
    "Uuid": string,
    "OrderUuid": string,
    "Exchange": string,
    "OrderType": string,
    "Quantity": number,
    "QuantityRemaining": number,
    "Limit": number,
    "CommissionPaid": number,
    "Price": number,
    "PricePerUnit": number,
    "Opened": string,
    "Closed": string,
    "CancelInitiated": boolean,
    "ImmediateOrCancel": boolean,
    "IsConditional": boolean,
    "Condition": string,
    "ConditionTarget": string,
    "currentBid": number,
    "currentAsk": number
}
interface OrderDelta
{
    U              : string, // uuid
    I                : string,// Id
    OU         : string, // OrderUuid
    E          : string, // Exchange
    OT         : string, // ordertype
    Q          : number,// Quantity
    q : number,// QuantityRemaining
    X             : number,// Limit
    n    : number,// CommissionPaid
    P             : number,// Price
    PU      : number,// PricePerUnit
    Y            : number,// Opened
    C            : number,// Closed
    i            : boolean,// IsOpen
    CI   : boolean,// CancelInitiated
    K : boolean,// ImmediateOrCancel
    k     : boolean,// IsConditional
    J         : string,// Condition
    j   : number,// ConditionTarget
    u           : number// Updated
}