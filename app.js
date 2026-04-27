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

  if(!nombre || !direccion || !telefono){
    alert("Completá todo")
    return
  }

  alumnos.push({nombre, direccion, telefono})

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
      <b>${a.nombre}</b> - ${a.direccion}
      <button onclick="eliminarAlumno(${i})">🗑</button>
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

// 📡 GPS CHOFER
function iniciarGPS(){

if(watchID !== null) return

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

// 🚐 COMENZAR RUTA (FIX REAL 🔥)
// 🚐 COMENZAR RUTA DESDE MI GPS 🔥
async function comenzarRuta(){

  if(alumnos.length < 1){
    alert("No hay alumnos")
    return
  }

  mostrar("pantallaGPS")

  // ⏳ esperar mapa
  await new Promise(r => setTimeout(r, 800))

  let puntos = []

  try {

    // 🔥 1. OBTENER TU UBICACIÓN ACTUAL
    let pos = await new Promise((resolve, reject)=>{
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })

    let latActual = pos.coords.latitude
    let lonActual = pos.coords.longitude

    // 🔥 PRIMER PUNTO = VOS
    puntos.push([latActual, lonActual])

    // 🔥 2. CARGAR ALUMNOS
    for (let a of alumnos){

      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(a.direccion)}`)
      let data = await res.json()

      if(data && data[0]){
        let lat = parseFloat(data[0].lat)
        let lon = parseFloat(data[0].lon)

        puntos.push([lat, lon])
      }
    }

    if(puntos.length < 2){
      alert("No se pudo armar la ruta")
      return
    }

    // 🔥 borrar anterior
    if(window.rutaLinea){
      mapChofer.removeLayer(window.rutaLinea)
    }

    // 🔥 dibujar ruta
    window.rutaLinea = L.polyline(puntos, {
      color: "blue",
      weight: 5
    }).addTo(mapChofer)

    // 🔥 ajustar vista
    mapChofer.fitBounds(window.rutaLinea.getBounds())

  } catch(err){
    console.log("Error ruta:", err)
    alert("Error al obtener ubicación o direcciones")
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
