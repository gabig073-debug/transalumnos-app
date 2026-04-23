// 🔥 TOKEN
const TOKEN = "trans_oran_2026"

// 🔥 FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBCd1wAUZo2HVUT-1-YuXgMukHlQP8I0Xo",
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
let circleChofer = null

let mapPadres = null
let markerPadres = null
let circlePadres = null

// 🚐 ICONO COLECTIVO
const iconoColectivo = L.icon({
  iconUrl: "colectivo.png",
  iconSize: [60, 60],
  iconAnchor: [28, 28]
})

// 🔄 CAMBIO DE PANTALLAS (FIX 🔥)
function mostrar(p){

  ["pantallaModo","pantallaGPS","pantallaPadres"]
  .forEach(id => {
    let el = document.getElementById(id)
    if(el){
      el.style.display = "none"
    }
  })

  let pantalla = document.getElementById(p)
  if(pantalla){
    pantalla.style.display = "block"
  }

  // 🔥 esperar a que el div sea visible
  setTimeout(()=>{
    if(p==="pantallaGPS") iniciarGPS()
    if(p==="pantallaPadres") iniciarPadres()
  }, 200)
}

// 🚐
function modoChofer(){
  mostrar("pantallaGPS")
}

// 👨‍👩‍👧
function modoPadres(){
  mostrar("pantallaPadres")
}

// 📡 GPS CHOFER
function iniciarGPS(){

// 🔥 destruir mapa anterior
if(mapChofer){
  mapChofer.remove()
  mapChofer = null
  markerChofer = null
  circleChofer = null
}

// 🔥 crear mapa
mapChofer = L.map('mapa').setView([0,0], 16)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(mapChofer)

// 🔥 FIX visual (clave)
setTimeout(()=>{
  mapChofer.invalidateSize()
},300)

// 🔥 reiniciar GPS
if(watchID !== null){
  navigator.geolocation.clearWatch(watchID)
}

watchID = navigator.geolocation.watchPosition((pos)=>{

  let lat = pos.coords.latitude
  let lon = pos.coords.longitude
  let accuracy = pos.coords.accuracy

  latActual = lat
  lonActual = lon

  // 🔥 guardar en firebase
  db.ref("ubicacion").set({
    lat,
    lon,
    accuracy,
    time: Date.now(),
    token: TOKEN
  })

  if(!markerChofer){
    markerChofer = L.marker([lat, lon], {icon: iconoColectivo}).addTo(mapChofer)
  }else{
    markerChofer.setLatLng([lat, lon])
  }

  if(!circleChofer){
    circleChofer = L.circle([lat, lon], {radius: accuracy}).addTo(mapChofer)
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

// 👨‍👩‍👧 PADRES
function iniciarPadres(){

// 🔥 destruir mapa anterior
if(mapPadres){
  mapPadres.remove()
  mapPadres = null
  markerPadres = null
  circlePadres = null
}

// 🔥 crear mapa
mapPadres = L.map('mapaPadres').setView([0,0], 16)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(mapPadres)

// 🔥 FIX visual (clave)
setTimeout(()=>{
  mapPadres.invalidateSize()
},300)

// 🔄 escuchar firebase
db.ref("ubicacion").on("value",(snap)=>{

  let data = snap.val()
  if(!data) return

  let lat = data.lat
  let lon = data.lon
  let accuracy = data.accuracy || 20

  if(!markerPadres){
    markerPadres = L.marker([lat, lon], {icon: iconoColectivo}).addTo(mapPadres)
  }else{
    markerPadres.setLatLng([lat, lon])
  }

  if(!circlePadres){
    circlePadres = L.circle([lat, lon], {radius: accuracy}).addTo(mapPadres)
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
