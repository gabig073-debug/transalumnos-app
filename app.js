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
let watchID = null // 🔥 evita duplicar GPS

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

alumnos.push({nombre,direccion,telefono,pago:false})
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
<p>${a.pago ? "🟢 Pagado" : "🔴 Pendiente"}</p>

<button onclick="whatsapp('${a.nombre}','${a.telefono}')">📱</button>
<button onclick="marcarPago(${i})">💰</button>
<button onclick="editarAlumno(${i})">✏</button>
<button onclick="eliminarAlumno(${i})">🗑</button>
</div>
`

lista.appendChild(li)
})
}

// 💰
function mostrarPagos(){
listaPagos.innerHTML=""

alumnos.forEach((a,i)=>{
let li = document.createElement("li")

li.innerHTML = `
<div class="card">
<h3>${a.nombre}</h3>
<p>${a.pago ? "🟢 Pagado" : "🔴 Pendiente"}</p>
<button onclick="marcarPago(${i})">Cambiar</button>
</div>
`

listaPagos.appendChild(li)
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
["pantallaInicio","pantallaAlumnos","pantallaPagos","pantallaRuta","pantallaGPS","pantallaPadres"]
.forEach(id => document.getElementById(id).style.display="none")

document.getElementById(p).style.display="block"

if(p==="pantallaPagos") mostrarPagos()
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

// 💰
function marcarPago(i){
alumnos[i].pago = !alumnos[i].pago
guardarDatos()
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
totalPagaron.innerText = alumnos.filter(a=>a.pago).length
totalPendientes.innerText = alumnos.filter(a=>!a.pago).length
}

// 🗺
function iniciarRuta(){
navigator.geolocation.getCurrentPosition((pos)=>{
window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${alumnos.map(a=>a.direccion).join("/")}`)
})
}

// 📡 GPS (MEJORADO 🔥)
function iniciarGPS(){

if(watchID !== null) return // evita duplicados

watchID = navigator.geolocation.watchPosition((pos)=>{

latActual = pos.coords.latitude
lonActual = pos.coords.longitude

db.ref("ubicacion").set({lat:latActual,lon:lonActual})

ubicacion.innerText = latActual + "," + lonActual

mapa.src = `https://maps.google.com/maps?q=${latActual},${lonActual}&z=16&output=embed`

})
}

// 👨‍👩‍👧
function iniciarPadres(){
db.ref("ubicacion").on("value",(snap)=>{
let data = snap.val()
if(!data) return

ubicacionPadres.innerText = data.lat + "," + data.lon
mapaPadres.src = `https://maps.google.com/maps?q=${data.lat},${data.lon}&z=16&output=embed`
})
}

// 📍
function abrirEnMapa(){
window.open(`https://www.google.com/maps?q=${latActual},${lonActual}`)
}

// 🔥 SERVICE WORKER PRO
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
  });
}