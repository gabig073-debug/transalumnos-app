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

let alumnos = []
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
let listenerPadresActivo = false

// 🔥 CARGAR DATOS
db.ref("alumnos").on("value", (snapshot) => {
  alumnos = snapshot.val() || []
  mostrarAlumnos()
  actualizarDashboard()
})

// 👦 AGREGAR
function agregarAlumno(){
let nombre = nombreInput.value
let direccion = direccionInput.value
let telefono = telefonoInput.value

if(!nombre || !direccion || !telefono){
alert("Completá todo")
return
}

alumnos.push({nombre,direccion,telefono})
guardarDatos()

nombreInput.value=""
direccionInput.value=""
telefonoInput.value=""
}

// 💾
function guardarDatos(){
db.ref("alumnos").set(alumnos)
}

// 📋
function mostrarAlumnos(){
lista.innerHTML=""

alumnos.forEach((a,i)=>{
let li = document.createElement("li")

li.innerHTML = `
<div class="card">
<h3>${a.nombre}</h3>
<p>${a.direccion}</p>

<button onclick="whatsapp('${a.nombre}','${a.telefono}')">📱</button>
<button onclick="editarAlumno(${i})">✏</button>
<button onclick="eliminarAlumno(${i})">🗑</button>
</div>
`

lista.appendChild(li)
})
}

// 🚐
function mostrarRuta(){
listaRuta.innerHTML=""

alumnos.forEach((a,i)=>{
let li = document.createElement("li")

li.innerHTML = `
<div class="card">
<h3>${i+1}. ${a.nombre}</h3>
<p>${a.direccion}</p>
</div>
`

listaRuta.appendChild(li)
})
}

// 🔄
function mostrar(p){
["pantallaInicio","pantallaAlumnos","pantallaRuta","pantallaGPS","pantallaPadres"]
.forEach(id => document.getElementById(id).style.display="none")

document.getElementById(p).style.display="block"

if(p==="pantallaRuta") mostrarRuta()
if(p==="pantallaGPS") iniciarGPS()
if(p==="pantallaPadres") iniciarPadres()
}

// 📱
function whatsapp(nombre,telefono){
window.open("https://wa.me/54"+telefono+"?text="+encodeURIComponent("Hola, estamos llegando por "+nombre))
}

// 🗑
function eliminarAlumno(i){
if(confirm("Eliminar?")){
alumnos.splice(i,1)
guardarDatos()
}
}

// ✏
function editarAlumno(i){
let n = prompt("Nombre", alumnos[i].nombre)
if(n){
alumnos[i].nombre = n
guardarDatos()
}
}

// 📊
function actualizarDashboard(){
totalAlumnos.innerText = alumnos.length
}

// 🗺
function iniciarRuta(){
navigator.geolocation.getCurrentPosition((pos)=>{
window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${alumnos.map(a=>a.direccion).join("/")}`)
})
}

// 📡 GPS CHOFER (ARREGLADO 🔥)
function iniciarGPS(){

// 🔥 SOLUCIÓN: reiniciar siempre el GPS
if(watchID !== null){
  navigator.geolocation.clearWatch(watchID)
}

// 🗺 MAPA
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

  // 🔥 ACTUALIZA SIEMPRE FIREBASE
  db.ref("ubicacion").set({
    lat: lat,
    lon: lon,
    accuracy: accuracy,
    time: Date.now()
  })

  ubicacion.innerText =
    "Lat: " + lat +
    "\nLon: " + lon +
    "\nPrecisión: " + Math.round(accuracy) + "m"

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

// 👨‍👩‍👧 PADRES
function iniciarPadres(){

if(listenerPadresActivo) return
listenerPadresActivo = true

if(!mapPadres){
  mapPadres = L.map('mapaPadres').setView([0,0], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(mapPadres)
}

// 🔥 arregla mapa oculto
setTimeout(()=>{
  mapPadres.invalidateSize()
},300)

db.ref("ubicacion").on("value",(snap)=>{

let data = snap.val()
if(!data) return

let lat = data.lat
let lon = data.lon
let accuracy = data.accuracy || 20

ubicacionPadres.innerText =
  "Lat: " + lat +
  "\nLon: " + lon +
  "\nPrecisión: " + Math.round(accuracy) + "m"

if(!markerPadres){
  markerPadres = L.marker([lat, lon]).addTo(mapPadres)
}else{
  markerPadres.setLatLng([lat, lon])
}

if(!circlePadres){
  circlePadres = L.circle([lat, lon], {
    radius: accuracy,
    color: "blue",
    fillOpacity: 0.2
  }).addTo(mapPadres)
}else{
  circlePadres.setLatLng([lat, lon])
  circlePadres.setRadius(accuracy)
}

mapPadres.setView([lat, lon], 17)

})

}

// 📍
function abrirEnMapa(){
window.open(`https://www.google.com/maps?q=${latActual},${lonActual}`)
}

// 🔥 SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
  });
}
