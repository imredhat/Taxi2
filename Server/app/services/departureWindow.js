const departureGraceMs=30*60*1000;
const departureCutoffSql=`NOW()-INTERVAL '${departureGraceMs} milliseconds'`;
const isDepartureOpen=(value,now=Date.now())=>value!=null&&new Date(value).getTime()>now-departureGraceMs;
module.exports={departureGraceMs,departureCutoffSql,isDepartureOpen};
