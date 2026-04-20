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

let mapPadres = null
let markerPadres = null

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

// 📡 GPS CHOFER (MAPA REAL)
function iniciarGPS(){

if(watchID !== null) return

// 🗺 CREAR MAPA
if(!mapChofer){
mapChofer = L.map('mapa').setView([0,0], 16)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© OpenStreetMap'
}).addTo(mapChofer)
}

let circle = null

watchID = navigator.geolocation.watchPosition((pos)=>{

let lat = pos.coords.latitude
let lon = pos.coords.longitude
let accuracy = pos.coords.accuracy

latActual = lat
lonActual = lon

// 🔥 GUARDAR
db.ref("ubicacion").set({
lat: lat,
lon: lon,
accuracy: accuracy,
time: Date.now()
})

// TEXTO
ubicacion.innerText =
"Lat: " + lat + "\nLon: " + lon + "\nPrecisión: " + Math.round(accuracy) + "m"

// 📍 MARCADOR
if(!markerChofer){
markerChofer = L.marker([lat, lon]).addTo(mapChofer)
}else{
markerChofer.setLatLng([lat, lon])
}

// 🔵 CÍRCULO DE PRECISIÓN
if(!circle){
circle = L.circle([lat, lon], {radius: accuracy}).addTo(mapChofer)
}else{
circle.setLatLng([lat, lon])
circle.setRadius(accuracy)
}

// 🎯 CENTRAR SOLO LA PRIMERA VEZ
if(!mapChofer._centrado){
mapChofer.setView([lat, lon], 17)
mapChofer._centrado = true
}

},
(err)=>{
alert("Error GPS: " + err.message)
},
{
enableHighAccuracy:true,
timeout:20000,
maximumAge:0
})

}

// 🗺 CREAR MAPA
if(!mapChofer){
mapChofer = L.map('mapa').setView([-23.13, -64.32], 15)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© OpenStreetMap'
}).addTo(mapChofer)
}

watchID = navigator.geolocation.watchPosition((pos)=>{

latActual = pos.coords.latitude
lonActual = pos.coords.longitude

// 🔥 GUARDAR EN FIREBASE
db.ref("ubicacion").set({lat:latActual,lon:lonActual})

// TEXTO
ubicacion.innerText = latActual + "," + lonActual

// MARCADOR
if(!markerChofer){
markerChofer = L.marker([latActual, lonActual]).addTo(mapChofer)
}else{
markerChofer.setLatLng([latActual, lonActual])
}

// CENTRAR
mapChofer.setView([latActual, lonActual], 16)

},{
enableHighAccuracy:true
})

}

// 👨‍👩‍👧 PADRES (MAPA EN VIVO)
function iniciarPadres(){

// CREAR MAPA
if(!mapPadres){
mapPadres = L.map('mapaPadres').setView([-23.13, -64.32], 15)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '© OpenStreetMap'
}).addTo(mapPadres)
}

// ESCUCHAR FIREBASE
db.ref("ubicacion").on("value",(snap)=>{

let data = snap.val()
if(!data) return

let lat = data.lat
let lon = data.lon

ubicacionPadres.innerText = lat + "," + lon

// MARCADOR
if(!markerPadres){
markerPadres = L.marker([lat, lon]).addTo(mapPadres)
}else{
markerPadres.setLatLng([lat, lon])
}

// CENTRAR
mapPadres.setView([lat, lon], 16)

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
