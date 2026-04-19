// 🔥 FIREBASE CONFIG (SOLO GPS)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO",
  databaseURL: "TU_DATABASE_URL",
  projectId: "TU_PROJECT_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 📦 DATOS LOCALES (SIN FIREBASE)
let alumnos = JSON.parse(localStorage.getItem("alumnos")) || []

let latActual = null
let lonActual = null

mostrarAlumnos()
actualizarDashboard()

// 👦 AGREGAR
function agregarAlumno(){
let nombre = document.getElementById("nombre").value
let direccion = document.getElementById("direccion").value
let telefono = document.getElementById("telefono").value

if(!nombre || !direccion || !telefono){
alert("Completá todo")
return
}

alumnos.push({ nombre, direccion, telefono })

guardarDatos()
mostrarAlumnos()
actualizarDashboard()

document.getElementById("nombre").value=""
document.getElementById("direccion").value=""
document.getElementById("telefono").value=""
}

// 💾 GUARDAR LOCAL
function guardarDatos(){
localStorage.setItem("alumnos", JSON.stringify(alumnos))
}

// 📋 MOSTRAR
function mostrarAlumnos(){
let lista = document.getElementById("lista")
if(!lista) return

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
document.getElementById("pantallaRuta").style.display="none"
document.getElementById("pantallaGPS").style.display="none"
document.getElementById("pantallaPadres").style.display="none"

document.getElementById(p).style.display="block"

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
mostrarAlumnos()
actualizarDashboard()
}
}

// ✏
function editarAlumno(i){
let n = prompt("Nombre", alumnos[i].nombre)
if(n){
alumnos[i].nombre = n
guardarDatos()
mostrarAlumnos()
}
}

// 📊 DASHBOARD
function actualizarDashboard(){
document.getElementById("totalAlumnos").innerText = alumnos.length
}

// 🗺 RUTA
function iniciarRuta(){
navigator.geolocation.getCurrentPosition((pos)=>{
let url = "https://www.google.com/maps/dir/"+pos.coords.latitude+","+pos.coords.longitude+"/"+alumnos.map(a=>a.direccion).join("/")
window.open(url)
})
}

// 📡 GPS CHOFER (🔥 GUARDA EN FIREBASE)
function iniciarGPS(){

let texto = document.getElementById("ubicacion")
let mapa = document.getElementById("mapa")

if(!texto || !mapa){
alert("Error: elementos no encontrados")
return
}

navigator.geolocation.watchPosition((pos)=>{

let lat = pos.coords.latitude
let lon = pos.coords.longitude

latActual = lat
lonActual = lon

// 🔥 ACTUALIZA TEXTO
texto.innerText = "Lat: " + lat + " | Lon: " + lon

// 🔥 ACTUALIZA MAPA
mapa.src = "https://maps.google.com/maps?q="+lat+","+lon+"&z=16&output=embed"

// 🔥 GUARDA EN FIREBASE
db.ref("ubicacion").set({
lat: lat,
lon: lon,
time: Date.now()
})

},
(err)=>{
alert("Error GPS: " + err.message)
},
{
enableHighAccuracy:true,
timeout:15000,
maximumAge:0
})

}
// 👨‍👩‍👧 PADRES (🔥 SOLO LEE FIREBASE)
function iniciarPadres(){

db.ref("ubicacion").on("value",(snap)=>{

let data = snap.val()
if(!data) return

document.getElementById("ubicacionPadres").innerText =
data.lat + "," + data.lon

document.getElementById("mapaPadres").src =
"https://maps.google.com/maps?q="+data.lat+","+data.lon+"&z=16&output=embed"

})
}

// 📍
function abrirEnMapa(){
window.open("https://www.google.com/maps?q="+latActual+","+lonActual)
}

// SERVICE WORKER
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
}

setTimeout(()=>{
iniciarGPS()
},2000)
