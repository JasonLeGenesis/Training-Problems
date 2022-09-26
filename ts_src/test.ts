const axios = require("axios").default 

const main = async () => {
    var hey = {
        funds: 1572339,
        utxo: [
          {
            txid: '2e7aea2d3f913c97c20466ce710ad5509fcb1cabfb40f06a49b13580aa08439f',
            vout: 0,
            status: [Object],
            value: 10000
          },
          {
            txid: '40d20fda80e01dc2e44064a81c910a6ca237da6cefeb46631df91198d5c8fbc1',
            vout: 0,
            status: [Object],
            value: 1552339
          },
          {
            txid: 'ce2826da59731b25470c54e5085df7c6d4fb9eca13c29fb1c1da0c14134a9d2f',
            vout: 0,
            status: [Object],
            value: 10000
          }
        ]
       
}
    var amount = 1000 
    console.log(hey['utxo'][0].value-amount)
}
main()