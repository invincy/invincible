export function carryFinanceMonthForward(source,sourceKey='') {
  return {
    accounts:(source.accounts||[]).map(account=>({...account,openingBalance:Number(account.balance||0)})),
    bills:(source.bills||[]).map(bill=>({...bill,amount:0,paid:false})),
    transactions:[],
    checklist:(source.checklist||[]).map(item=>({...item,done:false})),
    initializedFrom:sourceKey
  };
}
