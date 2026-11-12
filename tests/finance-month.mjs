import test from 'node:test';
import assert from 'node:assert/strict';
import {carryFinanceMonthForward} from '../react/src/finance-month.mjs';

test('a new finance month keeps card identity but clears the prior bill',()=>{
  const october={
    accounts:[{id:'bank',name:'Savings',balance:42500,openingBalance:60000}],
    bills:[{id:'card',name:'Axis Flipkart',last4:'1234',amount:18750,paid:true}],
    transactions:[{id:'salary',type:'income',amount:100000}],
    checklist:[{id:'rent',label:'Rent',done:true}]
  };

  const november=carryFinanceMonthForward(october,'2026-10');

  assert.deepEqual(november.bills,[{id:'card',name:'Axis Flipkart',last4:'1234',amount:0,paid:false}]);
  assert.deepEqual(november.transactions,[]);
  assert.equal(november.accounts[0].openingBalance,42500);
  assert.equal(november.checklist[0].done,false);
  assert.equal(november.initializedFrom,'2026-10');
  assert.equal(october.bills[0].amount,18750,'the historical month remains unchanged');
  assert.equal(october.bills[0].paid,true,'the historical paid state remains unchanged');
});
