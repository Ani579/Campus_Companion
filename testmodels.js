const url = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyAZCOTWS2mUp8pqN5Wrqu0FHtS7ODcpdR8";
fetch(url).then(r=>r.json()).then(d=>console.log(d.models.map(m=>m.name))).catch(console.error);
