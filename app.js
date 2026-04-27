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
let alumnos = []
let watchID = null
let ultimaUbicacion = null

let mapChofer = null
let markerChofer = null
let circleChofer = null

let mapPadres = null
let markerPadres = null
let circlePadres = null

// 🚐 ICONO
const iconoColectivo = L.icon({
  iconUrl: "colectivo.png",
  iconSize: [60, 60],
  iconAnchor: [28, 28]
})

// 🔥 CARGAR ALUMNOS
db.ref("alumnos").on("value", (snap)=>{
  alumnos = snap.val() || []
  mostrarAlumnos()
})

// 🔄 PANTALLAS
function mostrar(p){

  ["pantallaModo","pantallaAlumnos","pantallaRuta","pantallaGPS","pantallaPadres"]
  .forEach(id=>{
    let el = document.getElementById(id)
    if(el) el.style.display="none"
  })

  document.getElementById(p).style.display="block"

  setTimeout(()=>{
    if(p==="pantallaGPS") iniciarGPS()
    if(p==="pantallaPadres") iniciarPadres()
    if(p==="pantallaRuta") mostrarRuta()
  },200)
}

// 🚐
function modoChofer(){
  mostrar("pantallaAlumnos")
}

// 👨‍👩‍👧
function modoPadres(){
  mostrar("pantallaPadres")
}

// 👦 AGREGAR
function agregarAlumno(){

  let nombre = document.getElementById("nombre").value
  let direccion = document.getElementById("direccion").value
  let telefono = document.getElementById("telefono").value

  if(!nombre || !direccion || !telefono || latSeleccion===null){
    alert("Completá todo y elegí ubicación en el mapa")
    return
  }

  alumnos.push({
    nombre,
    direccion,
    telefono,
    lat: latSeleccion,
    lon: lonSeleccion
  })

  db.ref("alumnos").set(alumnos)

  document.getElementById("nombre").value=""
  document.getElementById("direccion").value=""
  document.getElementById("telefono").value=""
}

// 📋 LISTA
function mostrarAlumnos(){
  let lista = document.getElementById("lista")
  if(!lista) return

  lista.innerHTML=""

  alumnos.forEach((a,i)=>{
    let li = document.createElement("li")

    li.innerHTML = `
  <b>${a.nombre}</b><br>
  📍 ${a.direccion}<br>
  📞 ${a.telefono}
`
    `
    lista.appendChild(li)
  })
}

// 🗑
function eliminarAlumno(i){
  alumnos.splice(i,1)
  db.ref("alumnos").set(alumnos)
}

// 🛣 RUTA
function mostrarRuta(){

  let lista = document.getElementById("listaRuta")
  lista.innerHTML=""

  alumnos.forEach((a,i)=>{
    let li = document.createElement("li")

    li.innerHTML = `
      ${i+1}. ${a.nombre}
      <button onclick="subir(${i})">⬆️</button>
      <button onclick="bajar(${i})">⬇️</button>
      <button onclick="comenzarRuta()">▶️</button>
    `

    lista.appendChild(li)
  })
}

function subir(i){
  if(i===0) return
  [alumnos[i], alumnos[i-1]] = [alumnos[i-1], alumnos[i]]
  db.ref("alumnos").set(alumnos)
  mostrarRuta()
}

function bajar(i){
  if(i===alumnos.length-1) return
  [alumnos[i], alumnos[i+1]] = [alumnos[i+1], alumnos[i]]
  db.ref("alumnos").set(alumnos)
  mostrarRuta()
}

// 📡 GPS CHOFER (FIX TOTAL)
function iniciarGPS(){

  // 🔥 reiniciar SIEMPRE (clave para celular)
  if(watchID !== null){
    navigator.geolocation.clearWatch(watchID)
    watchID = null
  }

  if(!mapChofer){
    mapChofer = L.map('mapa').setView([0,0], 16)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(mapChofer)

    setTimeout(()=>mapChofer.invalidateSize(),300)
  }

  watchID = navigator.geolocation.watchPosition((pos)=>{

    let lat = pos.coords.latitude
    let lon = pos.coords.longitude
    let accuracy = pos.coords.accuracy

    // 🔥 GUARDAR UBICACIÓN REAL
    ultimaUbicacion = {lat, lon}

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

    if(!window.rutaActiva){
      mapChofer.setView([lat, lon], 17)
    }

  },
  (err)=>{
    console.log("GPS error:", err)
  },
  {
    enableHighAccuracy:true,
    timeout:15000,
    maximumAge:0
  })
}

// 👨‍👩‍👧 PADRES
function iniciarPadres(){

if(mapPadres){
  mapPadres.remove()
  mapPadres=null
  markerPadres=null
  circlePadres=null
}

mapPadres = L.map('mapaPadres').setView([0,0], 16)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapPadres)

setTimeout(()=>mapPadres.invalidateSize(),300)

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

async function comenzarRuta(){

  if(alumnos.length < 1){
    alert("No hay alumnos")
    return
  }

  window.rutaActiva = true

  // esperar GPS listo
  let intentos = 0
  while(!markerChofer && intentos < 10){
    await new Promise(r => setTimeout(r, 500))
    intentos++
  }

  if(!markerChofer){
    alert("El GPS no está listo")
    return
  }

  let pos = markerChofer.getLatLng()

  let coords = [`${pos.lng},${pos.lat}`] // 🔥 OSRM usa LON,LAT

  try {

    // 📍 convertir direcciones a coords
    for (let a of alumnos){

      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(a.direccion)}`)
      let data = await res.json()

      if(data && data[0]){
        coords.push(`${data[0].lon},${data[0].lat}`)
      }
    }

    // 🚀 pedir ruta real a OSRM
    let url = `https://router.project-osrm.org/route/v1/driving/${coords.join(";")}?overview=full&geometries=geojson`

    let rutaRes = await fetch(url)
    let rutaData = await rutaRes.json()

    let rutaCoords = rutaData.routes[0].geometry.coordinates

    // 🔄 convertir a formato Leaflet
    let latlngs = rutaCoords.map(c => [c[1], c[0]])

    if(window.rutaLinea){
      mapChofer.removeLayer(window.rutaLinea)
    }

    window.rutaLinea = L.polyline(latlngs, {
      weight: 5
    }).addTo(mapChofer)

    mapChofer.fitBounds(window.rutaLinea.getBounds())

  } catch(err){
    console.log("Error ruta:", err)
    alert("Error al generar ruta")
  }
}

// 🔙
function volverModo(){
  location.reload()
}

// 🔥 SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
  });
}
