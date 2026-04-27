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
let latActual = null
let lonActual = null
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

  
    if(p==="pantallaGPS") iniciarGPS()
    if(p==="pantallaPadres") iniciarPadres()
    if(p==="pantallaRuta") mostrarRuta()

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

  alumnos.push({nombre,direccion,telefono})

  db.ref("alumnos").set(alumnos)

  // 🔥 limpiar
  document.getElementById("nombre").value=""
  document.getElementById("direccion").value=""
  document.getElementById("telefono").value=""

  // 🔥 ACTUALIZAR EN EL MOMENTO
  mostrarAlumnos()
  mostrarRuta()
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
  let temp = alumnos[i]
  alumnos[i]=alumnos[i-1]
  alumnos[i-1]=temp
  db.ref("alumnos").set(alumnos)
  mostrarRuta()
}

function bajar(i){
  if(i===alumnos.length-1) return
  let temp = alumnos[i]
  alumnos[i]=alumnos[i+1]
  alumnos[i+1]=temp
  db.ref("alumnos").set(alumnos)
  mostrarRuta()
}

// 📡 GPS CHOFER
function iniciarGPS(){

// 🔥 NO reiniciar si ya está activo
if(watchID !== null) return

// 🗺 crear mapa UNA sola vez
if(!mapChofer){
  mapChofer = L.map('mapa').setView([0,0], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  .addTo(mapChofer)

  setTimeout(()=>{
    mapChofer.invalidateSize()
  },300)
}

// 📡 iniciar GPS UNA sola vez
watchID = navigator.geolocation.watchPosition((pos)=>{

  let lat = pos.coords.latitude
  let lon = pos.coords.longitude
  let accuracy = pos.coords.accuracy

  // 🔥 guardar en firebase
  db.ref("ubicacion").set({
    lat,
    lon,
    accuracy,
    time: Date.now(),
    token: TOKEN
  })

  // 🚐 marcador
  if(!markerChofer){
    markerChofer = L.marker([lat, lon], {icon: iconoColectivo})
    .addTo(mapChofer)
  }else{
    markerChofer.setLatLng([lat, lon])
  }

  // 🔵 círculo
  if(!circleChofer){
    circleChofer = L.circle([lat, lon], {radius: accuracy})
    .addTo(mapChofer)
  }else{
    circleChofer.setLatLng([lat, lon])
    circleChofer.setRadius(accuracy)
  }

  mapChofer.setView([lat, lon], 17)

},
(err)=>{
  console.log("GPS error:", err)
},
{
  enableHighAccuracy:true,
  timeout:10000,
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
