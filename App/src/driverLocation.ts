type Fix = {
 timestamp:number;
 coords:{latitude:number;longitude:number;accuracy:number|null};
};

function distance(a:Fix,b:Fix){
 const radians=Math.PI/180;
 const lat=(b.coords.latitude-a.coords.latitude)*radians;
 const lng=(b.coords.longitude-a.coords.longitude)*radians;
 const arc=Math.sin(lat/2)**2+Math.cos(a.coords.latitude*radians)*Math.cos(b.coords.latitude*radians)*Math.sin(lng/2)**2;
 return 12742000*Math.asin(Math.sqrt(Math.min(1,arc)));
}

export function updateDriverFix<T extends Fix>(previous:T|null,pending:T|null,next:T){
 if(!previous)return {position:next,pending:null};
 if(next.timestamp<=previous.timestamp)return {position:previous,pending};
 const elapsed=(next.timestamp-previous.timestamp)/1000;
 if(distance(previous,next)<=500+elapsed*60)return {position:next,pending:null};
 const precise=next.coords.accuracy!=null&&next.coords.accuracy<=150;
 if(precise&&pending&&next.timestamp>pending.timestamp&&next.timestamp-pending.timestamp<30000&&distance(pending,next)<=300){
  return {position:next,pending:null};
 }
 return {position:previous,pending:precise?next:null};
}
