const {departureCutoffSql,departureGraceMs}=require('./departureWindow');
const {decodePolyline}=require('./fareContext');

const offerColumns=` q.id,q.created_at,q.scheduled_at,q.estimated_fare::text AS fare,q.distance_km,q.duration_minutes,q.route_polyline,
    q.pickup_address,q.dropoff_address,q.passenger_count,CASE WHEN q.booking_details->>'notes'=q.notes THEN NULL ELSE q.notes END AS notes,q.booking_details,
    ST_Y(q.pickup_location::geometry) AS pickup_lat,ST_X(q.pickup_location::geometry) AS pickup_lng,
    ST_Y(q.dropoff_location::geometry) AS dropoff_lat,ST_X(q.dropoff_location::geometry) AS dropoff_lng, q.car_class`;
const availableOffer=`q.status IN ('pending','searching') AND (q.ride_type='intercity' OR (q.ride_type='normal' AND q.client_reference IS NOT NULL)) AND q.scheduled_at>${departureCutoffSql} AND q.estimated_fare IS NOT NULL
 AND NOT EXISTS(SELECT 1 FROM rides r WHERE r.request_id=q.id AND r.status NOT IN ('cancelled','expired'))`;

function offerFromRow(row){
    const {booking_details:details,route_polyline,car_class,...offer}=row;
    const departure=row.scheduled_at==null?NaN:new Date(row.scheduled_at).getTime();
    let coordinates=[];
    try { if(route_polyline)coordinates=decodePolyline(route_polyline); } catch { /* Historical records may lack usable geometry. */ }
    const points=list=>list.map(({lat,lng,address})=>({lat,lng,address}));
    return {...offer,...(Number.isFinite(departure)?{offer_expires_at:new Date(departure+departureGraceMs).toISOString()}:{}),
      starts:details?.starts?.length?points(details.starts):[{lat:row.pickup_lat,lng:row.pickup_lng,address:row.pickup_address}],
      ends:details?.ends?.length?points(details.ends):[{lat:row.dropoff_lat,lng:row.dropoff_lng,address:row.dropoff_address}],
      luggageCount:details?.luggageCount||0,bagCount:details?.bagCount||0,hasAnimals:!!details?.hasAnimals,animalType:details?.animalType||'',coordinates};
}

const {offerClass}=require('./vehiclePackages');
module.exports={offerColumns,availableOffer,offerFromRow,offerClass};
