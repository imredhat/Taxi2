require('dotenv').config();
const fs=require('node:fs');
const path=require('node:path');
const pool=require('../app/models/db');
(async()=>{
 const client=await pool.connect();
 try{
  for(const file of ['004_passenger_reservations.sql','005_passenger_api.sql','006_staff_usernames.sql','007_fare_quotes.sql','008_driver_active_vehicle.sql','009_dispatch_outbox.sql','010_dispatch_route_cache.sql','011_chat_receipts.sql','012_vehicle_packages.sql','013_city_and_premium_fares.sql','014_driver_trip_progress.sql','015_reservation_deposits.sql','016_full_reservation_payments.sql','017_vehicle_documents.sql','018_update_vehicle_catalog.sql','019_vehicle_approval.sql']){
   await client.query('BEGIN');
   try{await client.query(fs.readFileSync(path.join(__dirname,'../app/database/migrations',file),'utf8'));await client.query('COMMIT');console.log(`Applied ${file}`);}
   catch(error){await client.query('ROLLBACK');throw error;}
  }
 }finally{client.release();await pool.end();}
})().catch(error=>{console.error('Passenger migration failed:',error.code||error.message);process.exitCode=1;});
