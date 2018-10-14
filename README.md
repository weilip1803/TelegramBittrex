# TelegramBittrex
Telegram notifications for bittrex trades and account balance. 

Please get familiar with firebase and bittrex api on your own.

https://github.com/Bittrex/bittrex.github.io
https://firebase.google.com/docs/functions/get-started
https://core.telegram.org/bots

This is serves as a help for anyone who wants to build a basic telegram bot that retrives your bittrex account information when ever you send a text to the Bot chat. For the program to work you got to enter your chat_id on line 36 of index.ts and replace all the <Variables> to your relavent information, Telegram bot url, Bittrex api_key, secrect_key. You will need to get your bittrex api keys by just opening up your account information API. 
  
# Message Example (Values set at random for example)
Balance
[ETH]:
        Balance: 9999999
        ethPrice:0.99605
        price:$196.45180
        BtcEstimate:100
        ValueEstimate:9999999999999
        percent: 50%
[SRN]:
        Balance:4203.8008
        ethPrice:0.00038
        price:$0.07510
        BtcEstimate:
        ValueEstimate:315.73
        percent:49%
[USDT]:
        Balance:5
        ethPrice:0.00507
        price:$1.00000
        BtcEstimate:
        ValueEstimate:
        percent:1%
Total Btc:<Your total amount of btc>
Total Value:<Your total Value>

**OpenOrders**
[ETH-NEO]:
        OrderType:LIMIT_BUY
        OpenDate:2018-10-03T12:46:2
        Quantity:102.09582
        QuantityRemaining:102.09582
        Limit:$0.078162
        CurrentBid:0.080109
        CurrentAsk:0.080300
        Total:7.980000

There is also a python program with connects to the bittrex beta api to listen for orderDeltas( Trade occurance ). This will relay the orderDelta to the firebase cloud functions and then it will send a message to your chat based on your chat id. 

# OrderDelta Relay example (Values set at random for example)
**OrderDelta**
[ETH-ADA]:
        OrderType:LIMIT_BUY
        Quantity(ADA):888.18998
        QuantityLeft(ADA):666.82747
        Units:12.22935 of ETH
        Limit:0.000309
        OpenDate:2018-01-17T21:01
        CloseDate:Not Closed
        IsCanceled:False

There is no security guarantee in any form please use the code at your own risk.


Licence (See LICENSE file for full license)
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
