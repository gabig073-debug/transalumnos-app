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

let latSeleccion = null
let lonSeleccion = null

let mapSeleccion = null
let markerSeleccion = null

let mapChofer = null
let markerChofer = null
let circleChofer = null

let mapPadres = null
let markerPadres = null
let circlePadres = null

let capasAlumnos = []

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

  ["pantallaModo","pantallaAlumnos","pantallaRuta","pantallaGPS","pantallaPadres","pantallaMapaSeleccion"]
  .forEach(id=>{
    let el = document.getElementById(id)
    if(el) el.style.display="none"
  })

  document.getElementById(p).style.display="block"

  setTimeout(()=>{
    if(p==="pantallaGPS") iniciarGPS()
    if(p==="pantallaPadres") iniciarPadres()
    if(p==="pantallaRuta") mostrarRuta()
    if(p==="pantallaMapaSeleccion") iniciarMapaSeleccion()
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
    alert("Completá todo y seleccioná ubicación en el mapa")
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

  latSeleccion = null
  lonSeleccion = null

  document.getElementById("nombre").value=""
  document.getElementById("direccion").value=""
  document.getElementById("telefono").value=""

  alert("Alumno guardado con ubicación ✅")
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

// 🔴 DIBUJAR ALUMNOS
function dibujarAlumnosEnMapa(){

  if(!mapChofer) return

  capasAlumnos.forEach(c => mapChofer.removeLayer(c))
  capasAlumnos = []

  alumnos.forEach(a=>{

    if(a.lat && a.lon){

      let circulo = L.circle([a.lat, a.lon], {
        radius: 20,
        color: "red",
        fillColor: "red",
        fillOpacity: 0.5
      }).addTo(mapChofer)

      let popup = L.marker([a.lat, a.lon])
        .bindPopup(`<b>${a.nombre}</b><br>${a.direccion}`)
        .addTo(mapChofer)

      capasAlumnos.push(circulo)
      capasAlumnos.push(popup)
    }

  })
}

// 📡 GPS CHOFER
function iniciarGPS(){

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

    dibujarAlumnosEnMapa()

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

// 🚐 RUTA REAL
async function comenzarRuta(){

  if(alumnos.length < 1 || !ultimaUbicacion){
    alert("Falta GPS o alumnos")
    return
  }

  window.rutaActiva = true

  let coords = [`${ultimaUbicacion.lon},${ultimaUbicacion.lat}`]

  alumnos.forEach(a=>{
    if(a.lat && a.lon){
      coords.push(`${a.lon},${a.lat}`)
    }
  })

  let url = `https://router.project-osrm.org/route/v1/driving/${coords.join(";")}?overview=full&geometries=geojson`

  let res = await fetch(url)
  let data = await res.json()

  let rutaCoords = data.routes[0].geometry.coordinates
  let latlngs = rutaCoords.map(c => [c[1], c[0]])

  if(window.rutaLinea){
    mapChofer.removeLayer(window.rutaLinea)
  }

  window.rutaLinea = L.polyline(latlngs, {weight:5}).addTo(mapChofer)

  mapChofer.fitBounds(window.rutaLinea.getBounds())

  dibujarAlumnosEnMapa()
}

// 📍 MAPA SELECCIÓN
function abrirMapaSeleccion(){
  mostrar("pantallaMapaSeleccion")
}

function iniciarMapaSeleccion(){

  if(!mapSeleccion){
    mapSeleccion = L.map('mapaSeleccion').setView([-23.13, -64.32], 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(mapSeleccion)

    mapSeleccion.on("click", (e)=>{

      latSeleccion = e.latlng.lat
      lonSeleccion = e.latlng.lng

      if(markerSeleccion){
        markerSeleccion.setLatLng(e.latlng)
      }else{
        markerSeleccion = L.marker(e.latlng).addTo(mapSeleccion)
      }
    })
  }

  setTimeout(()=>mapSeleccion.invalidateSize(),300)
}

function guardarUbicacion(){
  if(latSeleccion===null){
    alert("Tocá el mapa primero")
    return
  }

  alert("Ubicación guardada 📍")
  mostrar("pantallaAlumnos")
}

// 🔙
function volverModo(){
  location.reload()
}
