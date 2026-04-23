// 🔥 FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "transalumnos-7841c.firebaseapp.com",
  databaseURL: "https://transalumnos-7841c-default-rtdb.firebaseio.com",
  projectId: "transalumnos-7841c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 📍 VARIABLES
let latActual = null
let lonActual = null
let watchID = null

let mapChofer = null
let markerChofer = null

let mapPadres = null
let markerPadres = null

// 🚐 ICONO COMBI
const iconoCombi = L.icon({
  iconUrl: "combi.png",
  iconSize: [60, 30],
  iconAnchor: [30, 15]
})

// 🔄 PANTALLAS
function mostrar(p){
  ["pantallaModo","pantallaGPS","pantallaPadres"]
  .forEach(id => document.getElementById(id).style.display="none")

  document.getElementById(p).style.display="block"
}

// 🚐 MODO
function modoChofer(){
  mostrar("pantallaGPS")
  iniciarGPS()
}

function modoPadres(){
  mostrar("pantallaPadres")
  iniciarPadres()
}

// 📡 GPS CHOFER
function iniciarGPS(){

  if(watchID !== null){
    navigator.geolocation.clearWatch(watchID)
  }

  if(!mapChofer){
    mapChofer = L.map('mapa').setView([0,0], 16)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(mapChofer)
  }

  watchID = navigator.geolocation.watchPosition((pos)=>{

    let lat = pos.coords.latitude
    let lon = pos.coords.longitude

    latActual = lat
    lonActual = lon

    // 🔥 GUARDAR EN FIREBASE
    db.ref("ubicacion").set({
      lat,
      lon,
      time: Date.now()
    })

    if(!markerChofer){
      markerChofer = L.marker([lat, lon], {icon: iconoCombi}).addTo(mapChofer)
    }else{
      markerChofer.setLatLng([lat, lon])
    }

    mapChofer.setView([lat, lon], 17)

  },{
    enableHighAccuracy:true
  })
}

// 👨‍👩‍👧 PADRES
function iniciarPadres(){

  if(!mapPadres){
    mapPadres = L.map('mapaPadres').setView([0,0], 16)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(mapPadres)
  }

  setTimeout(()=> mapPadres.invalidateSize(), 300)

  db.ref("ubicacion").on("value",(snap)=>{

    let data = snap.val()
    if(!data) return

    let lat = data.lat
    let lon = data.lon

    if(!markerPadres){
      markerPadres = L.marker([lat, lon], {icon: iconoCombi}).addTo(mapPadres)
    }else{
      markerPadres.setLatLng([lat, lon])
    }

    mapPadres.setView([lat, lon], 17)

  })
}

// 🎯 CENTRAR
function centrarMapa(){
  if(latActual && lonActual){
    mapChofer.setView([latActual, lonActual], 17)
  }
}

// 🔥 SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
  });
}
