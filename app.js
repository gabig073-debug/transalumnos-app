// 🔥 TOKEN DE SEGURIDAD
const TOKEN = "trans_oran_2026"

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBCd1wAUZo2HVUT-1-YuXgMukHlQP8I0Xo",
  authDomain: "transalumnos-7841c.firebaseapp.com",
  databaseURL: "https://transalumnos-7841c-default-rtdb.firebaseio.com",
  projectId: "transalumnos-7841c",
  storageBucket: "transalumnos-7841c.firebasestorage.app",
  messagingSenderId: "979657843687",
  appId: "1:979657843687:web:1e34083ad4f4905f159342"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 📍 VARIABLES GPS
let latActual = null
let lonActual = null
let watchID = null

// 🗺 MAPAS
let mapChofer = null
let markerChofer = null
let circleChofer = null

let mapPadres = null
let markerPadres = null
let circlePadres = null

// 🔄 CAMBIO DE PANTALLAS (simplificado)
function mostrar(p){

  ["pantallaModo","pantallaGPS","pantallaPadres"]
  .forEach(id => document.getElementById(id).style.display="none")

  document.getElementById(p).style.display="block"

  if(p==="pantallaGPS") iniciarGPS()
  if(p==="pantallaPadres") iniciarPadres()
}

// 🚐 MODO CHOFER
function modoChofer(){
  mostrar("pantallaGPS")
}

// 👨‍👩‍👧 MODO PADRES
function modoPadres(){
  mostrar("pantallaPadres")
}

// 📡 GPS CHOFER (CON TOKEN 🔐)
function iniciarGPS(){

// reiniciar GPS
if(watchID !== null){
  navigator.geolocation.clearWatch(watchID)
}

// mapa
if(!mapChofer){
  mapChofer = L.map('mapa').setView([0,0], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(mapChofer)
}

watchID = navigator.geolocation.watchPosition((pos)=>{

  let lat = pos.coords.latitude
  let lon = pos.coords.longitude
  let accuracy = pos.coords.accuracy

  latActual = lat
  lonActual = lon

  console.log("GPS:", lat, lon)

  // 🔥 GUARDAR CON TOKEN
  db.ref("ubicacion").set({
    lat: lat,
    lon: lon,
    accuracy: accuracy,
    time: Date.now(),
    token: TOKEN
  })

  if(!markerChofer){
    markerChofer = L.marker([lat, lon]).addTo(mapChofer)
  }else{
    markerChofer.setLatLng([lat, lon])
  }

  if(!circleChofer){
    circleChofer = L.circle([lat, lon], {
      radius: accuracy
    }).addTo(mapChofer)
  }else{
    circleChofer.setLatLng([lat, lon])
    circleChofer.setRadius(accuracy)
  }

  mapChofer.setView([lat, lon], 17)

},
(err)=>{
  alert("Error GPS: " + err.message)
},
{
  enableHighAccuracy:true,
  timeout:10000,
  maximumAge:0
})

}

// 👨‍👩‍👧 PADRES (ESTABLE 🔥)
function iniciarPadres(){

// mapa
if(!mapPadres){
  mapPadres = L.map('mapaPadres').setView([0,0], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(mapPadres)
}

// arreglar bug visual
setTimeout(()=>{
  mapPadres.invalidateSize()
},500)

// escuchar SIEMPRE
db.ref("ubicacion").on("value",(snap)=>{

  let data = snap.val()

  console.log("PADRES:", data)

  if(!data) return

  let lat = data.lat
  let lon = data.lon
  let accuracy = data.accuracy || 20

  if(!markerPadres){
    markerPadres = L.marker([lat, lon]).addTo(mapPadres)
  }else{
    markerPadres.setLatLng([lat, lon])
  }

  if(!circlePadres){
    circlePadres = L.circle([lat, lon], {
      radius: accuracy
    }).addTo(mapPadres)
  }else{
    circlePadres.setLatLng([lat, lon])
    circlePadres.setRadius(accuracy)
  }

  mapPadres.setView([lat, lon], 17)

})

}

// 🔥 SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
  });
}
