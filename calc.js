/* 주택용(저압) 전기요금 계산 — 2026년 4분기 기준
   기본요금·전력량요금: 한전 전기공급약관 별표1 (2023.11.9 적용, 2026년 4분기 동결)
   기후환경요금 9.0원/kWh, 연료비조정단가 +5.0원/kWh
   부가가치세 10%(원 미만 반올림), 전력산업기반기금 2.7%(10원 미만 절사), 청구액 10원 미만 절사 */
var RATE = {
  asOf: '2026년 4분기',
  basic: [910, 1600, 7300],
  energy: [120.0, 214.6, 307.3],
  superUser: 736.2,
  climate: 9.0,
  fuel: 5.0,
  vat: 0.10,
  fund: 0.027,
  minCharge: 1000,
  tiers: { other: [200, 400], winter: [200, 400], summer: [300, 450] }
};

function calcBill(kwh, season) {
  kwh = Math.max(0, Number(kwh) || 0);
  var t = RATE.tiers[season] || RATE.tiers.other;
  var tier = kwh <= t[0] ? 0 : (kwh <= t[1] ? 1 : 2);
  var basic = RATE.basic[tier];
  var e1 = Math.min(kwh, t[0]) * RATE.energy[0];
  var e2 = Math.max(0, Math.min(kwh, t[1]) - t[0]) * RATE.energy[1];
  var over = Math.max(0, kwh - t[1]);
  var superKwh = 0;
  if ((season === 'summer' || season === 'winter') && kwh > 1000) {
    superKwh = kwh - 1000;
    over -= superKwh;
  }
  var e3 = over * RATE.energy[2] + superKwh * RATE.superUser;
  var energy = Math.floor(e1 + e2 + e3);
  var base = basic + energy;
  if (base < RATE.minCharge) base = RATE.minCharge;
  var climate = Math.floor(kwh * RATE.climate);
  var fuel = Math.floor(kwh * RATE.fuel);
  var subtotal = base + climate + fuel;
  var vat = Math.round(subtotal * RATE.vat);
  var fund = Math.floor(subtotal * RATE.fund / 10) * 10;
  var total = Math.floor((subtotal + vat + fund) / 10) * 10;
  return {
    kwh: kwh, tier: tier + 1, basic: basic, energy: energy,
    climate: climate, fuel: fuel, subtotal: subtotal,
    vat: vat, fund: fund, total: total, superKwh: superKwh
  };
}

function seasonOfMonth(m) {
  if (m === 7 || m === 8) return 'summer';
  if (m === 12 || m === 1 || m === 2) return 'winter';
  return 'other';
}

if (typeof module !== 'undefined') module.exports = { calcBill: calcBill, RATE: RATE, seasonOfMonth: seasonOfMonth };
