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

// 🔧 VARIABLES
let alumnos = JSON.parse(localStorage.getItem("alumnos")) || []
let latActual = null
let lonActual = null

mostrarAlumnos()
actualizarDashboard()

// 👦 AGREGAR ALUMNO
function agregarAlumno(){

let nombre = document.getElementById("nombre").value
let direccion = document.getElementById("direccion").value
let telefono = document.getElementById("telefono").value

let alumno = {
nombre,
direccion,
telefono,
pago:false
}

alumnos.push(alumno)

guardarDatos()
mostrarAlumnos()
actualizarDashboard()

document.getElementById("nombre").value=""
document.getElementById("direccion").value=""
document.getElementById("telefono").value=""

}

// 📋 MOSTRAR ALUMNOS
function mostrarAlumnos(){

let lista = document.getElementById("lista")
lista.innerHTML=""

alumnos.forEach((a,i)=>{

let li = document.createElement("li")

li.innerHTML = `
<div class="card">
<h3>${a.nombre}</h3>
<p>📍 ${a.direccion}</p>
<p class="${a.pago ? 'pagado' : 'pendiente'}">
${a.pago ? "🟢 Pagado" : "🔴 Pendiente"}
</p>

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
<p class="${a.pago ? 'pagado' : 'pendiente'}">
${a.pago ? "🟢 Pagado" : "🔴 Pendiente"}
</p>
<button onclick="marcarPago(${i})">💰 Cambiar estado</button>
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
<p>📍 ${a.direccion}</p>
<button onclick="subir(${i})">⬆</button>
<button onclick="bajar(${i})">⬇</button>
</div>
`

lista.appendChild(li)

})

}

// 🔄 CAMBIAR PANTALLA
function mostrar(pantalla){

document.getElementById("pantallaInicio").style.display="none"
document.getElementById("pantallaAlumnos").style.display="none"
document.getElementById("pantallaPagos").style.display="none"
document.getElementById("pantallaRuta").style.display="none"
document.getElementById("pantallaGPS").style.display="none"

document.getElementById(pantalla).style.display="block"

if(pantalla==="pantallaPagos") mostrarPagos()
if(pantalla==="pantallaRuta") mostrarRuta()
if(pantalla==="pantallaGPS") iniciarGPS()

}

// 💾 GUARDAR
function guardarDatos(){
localStorage.setItem("alumnos", JSON.stringify(alumnos))
}

// 📱 WHATSAPP
function whatsapp(nombre,telefono){
let mensaje = "Hola, estamos llegando por " + nombre
let url = "https://wa.me/54" + telefono + "?text=" + encodeURIComponent(mensaje)
window.open(url)
}

// 🗑 ELIMINAR
function eliminarAlumno(i){
if(confirm("¿Eliminar alumno?")){
alumnos.splice(i,1)
guardarDatos()
mostrarAlumnos()
actualizarDashboard()
}
}

// 💰 PAGO
function marcarPago(i){
alumnos[i].pago = !alumnos[i].pago
guardarDatos()
mostrarAlumnos()
actualizarDashboard()
}

// ✏ EDITAR
function editarAlumno(i){
let nuevoNombre = prompt("Nombre", alumnos[i].nombre)
let nuevaDireccion = prompt("Dirección", alumnos[i].direccion)
let nuevoTelefono = prompt("Teléfono", alumnos[i].telefono)

if(nuevoNombre){
alumnos[i].nombre = nuevoNombre
alumnos[i].direccion = nuevaDireccion
alumnos[i].telefono = nuevoTelefono

guardarDatos()
mostrarAlumnos()
}
}

// 🔼 ORDEN
function subir(i){
if(i>0){
let temp = alumnos[i]
alumnos[i] = alumnos[i-1]
alumnos[i-1] = temp
guardarDatos()
mostrarRuta()
}
}

function bajar(i){
if(i < alumnos.length-1){
let temp = alumnos[i]
alumnos[i] = alumnos[i+1]
alumnos[i+1] = temp
guardarDatos()
mostrarRuta()
}
}

// 📊 DASHBOARD
function actualizarDashboard(){

let total = alumnos.length
let pagaron = alumnos.filter(a => a.pago).length
let pendientes = total - pagaron

document.getElementById("totalAlumnos").innerText = total
document.getElementById("totalPagaron").innerText = pagaron
document.getElementById("totalPendientes").innerText = pendientes

}

// 🗺 RUTA EN GOOGLE MAPS
function iniciarRuta(){
if(alumnos.length === 0){
alert("No hay alumnos")
return
}
let direcciones = alumnos.map(a => a.direccion)
let url = "https://www.google.com/maps/dir/" + direcciones.join("/")
window.open(url)
}

// 📍 GPS + FIREBASE
function iniciarGPS(){

if(!navigator.geolocation){
alert("GPS no disponible")
return
}

navigator.geolocation.watchPosition((pos)=>{

latActual = pos.coords.latitude
lonActual = pos.coords.longitude

// 🔥 GUARDAR EN FIREBASE
db.ref("ubicacion").set({
lat: latActual,
lon: lonActual,
time: Date.now()
})

document.getElementById("ubicacion").innerText =
"Lat: " + latActual + " | Lon: " + lonActual

let url = "https://maps.google.com/maps?q=" + latActual + "," + lonActual + "&z=18&output=embed"

document.getElementById("mapa").src = url

},
(error)=>{
alert("Error GPS")
},
{
enableHighAccuracy:true,
timeout:20000
})

}

// 📍 ABRIR MAPA REAL
function abrirEnMapa(){

if(latActual === null){
alert("Esperando ubicación...")
return
}

let url = "https://www.google.com/maps?q=" + latActual + "," + lonActual
window.open(url)

}
