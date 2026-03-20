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

// 🔥 CARGAR ALUMNOS EN TIEMPO REAL
db.ref("alumnos").on("value", (snapshot) => {
  alumnos = snapshot.val() || []
  mostrarAlumnos()
  actualizarDashboard()
})

// 👦 AGREGAR
function agregarAlumno(){
let nombre = document.getElementById("nombre").value
let direccion = document.getElementById("direccion").value
let telefono = document.getElementById("telefono").value

if(!nombre || !direccion || !telefono){
alert("Completá todo")
return
}

alumnos.push({
nombre,
direccion,
telefono,
pago:false
})

guardarDatos()

document.getElementById("nombre").value=""
document.getElementById("direccion").value=""
document.getElementById("telefono").value=""
}

// 💾 GUARDAR
function guardarDatos(){
db.ref("alumnos").set(alumnos)
}

// 📋 MOSTRAR
function mostrarAlumnos(){
let lista = document.getElementById("lista")
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

// 💰 PAGOS
function mostrarPagos(){
let lista = document.getElementById("listaPagos")
lista.innerHTML=""

alumnos.forEach((a,i)=>{
let li = document.createElement("li")

li.innerHTML = `
<div class="card">
<h3>${a.nombre}</h3>
<p>${a.pago ? "🟢 Pagado" : "🔴 Pendiente"}</p>
<button onclick="marcarPago(${i})">Cambiar</button>
</div>
`

lista.appendChild(li)
})
}

// 🚐 RUTA
function mostrarRuta(){
let lista = document.getElementById("listaRuta")
lista.innerHTML=""

alumnos.forEach((a,i)=>{
let li = document.createElement("li")

li.innerHTML = `
<div class="card">
<h3>${i+1}. ${a.nombre}</h3>
<p>${a.direccion}</p>
</div>
`

lista.appendChild(li)
})
}

// 🔄 PANTALLAS
function mostrar(p){

document.getElementById("pantallaInicio").style.display="none"
document.getElementById("pantallaAlumnos").style.display="none"
document.getElementById("pantallaPagos").style.display="none"
document.getElementById("pantallaRuta").style.display="none"
document.getElementById("pantallaGPS").style.display="none"
document.getElementById("pantallaPadres").style.display="none"

document.getElementById(p).style.display="block"

if(p==="pantallaPagos") mostrarPagos()
if(p==="pantallaRuta") mostrarRuta()
if(p==="pantallaGPS") iniciarGPS()
if(p==="pantallaPadres") iniciarPadres()
}

// 📱 WHATSAPP
function whatsapp(nombre,telefono){
let url = "https://wa.me/54"+telefono+"?text="+encodeURIComponent("Hola, estamos llegando por "+nombre)
window.open(url)
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
document.getElementById("totalAlumnos").innerText = alumnos.length
document.getElementById("totalPagaron").innerText = alumnos.filter(a=>a.pago).length
document.getElementById("totalPendientes").innerText = alumnos.filter(a=>!a.pago).length
}

// 🗺 RUTA REAL
function iniciarRuta(){
navigator.geolocation.getCurrentPosition((pos)=>{
let url = "https://www.google.com/maps/dir/"+pos.coords.latitude+","+pos.coords.longitude+"/"+alumnos.map(a=>a.direccion).join("/")
window.open(url)
})
}

// 📡 GPS CHOFER
function iniciarGPS(){
navigator.geolocation.watchPosition((pos)=>{

latActual = pos.coords.latitude
lonActual = pos.coords.longitude

db.ref("ubicacion").set({
lat: latActual,
lon: lonActual
})

document.getElementById("ubicacion").innerText =
latActual + "," + lonActual

document.getElementById("mapa").src =
"https://maps.google.com/maps?q="+latActual+","+lonActual+"&z=16&output=embed"

})
}

// 👨‍👩‍👧 PADRES
function iniciarPadres(){

db.ref("ubicacion").on("value",(snap)=>{

let data = snap.val()
if(!data) return

let lat = data.lat
let lon = data.lon

document.getElementById("ubicacionPadres").innerText =
lat + "," + lon

document.getElementById("mapaPadres").src =
"https://maps.google.com/maps?q="+lat+","+lon+"&z=16&output=embed"

})
}

// 📍
function abrirEnMapa(){
window.open("https://www.google.com/maps?q="+latActual+","+lonActual)
}
