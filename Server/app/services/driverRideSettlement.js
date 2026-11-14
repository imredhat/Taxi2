const companyPortion=value=>(BigInt(value)+4n)/5n;

// Callers hold the ride lock (or have just inserted the ride) and settle only once.
async function settleDriver(client,rideId,paidAmount){
 const {rows:[ride]}=await client.query('SELECT r.fare,r.driver_id,d.user_id FROM rides r JOIN driver_profiles d ON d.id=r.driver_id WHERE r.id=$1',[rideId]);
 const fare=BigInt(ride.fare), commission=companyPortion(fare), share=fare-commission, paid=BigInt(paidAmount);
 const deduction=paid-share;
 if(deduction<0n||deduction>commission)throw new Error('Unexpected driver settlement amount');
 await client.query('INSERT INTO wallets(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[ride.user_id]);
 const {rows:[wallet]}=await client.query('SELECT id,balance FROM wallets WHERE user_id=$1 FOR UPDATE',[ride.user_id]);
 const before=BigInt(wallet.balance), credited=before+paid, after=before+share;
 await client.query('UPDATE wallets SET balance=$2 WHERE id=$1',[wallet.id,after.toString()]);
 await client.query(`INSERT INTO transactions(wallet_id,type,amount,balance_before,balance_after,ride_id,reference_id,reference_type,description_fa)
 VALUES($1,'ride_payment',$2,$3,$4,$5,$5,'driver_ride','واریز کرایه سفر')`,[wallet.id,paid.toString(),before.toString(),credited.toString(),rideId]);
 if(deduction>0n)await client.query(`INSERT INTO transactions(wallet_id,type,amount,balance_before,balance_after,ride_id,reference_id,reference_type,description_fa)
 VALUES($1,'commission',$2,$3,$4,$5,$5,'driver_ride','کمیسیون، مالیات و ارزش افزوده')`,[wallet.id,(-deduction).toString(),credited.toString(),after.toString(),rideId]);
 await client.query(`INSERT INTO revenue_shares(ride_id,driver_id,total_fare,platform_commission,driver_share,commission_rate)
 VALUES($1,$2,$3,$4,$5,20)`,[rideId,ride.driver_id,fare.toString(),commission.toString(),share.toString()]);
}
module.exports={companyPortion,settleDriver};
