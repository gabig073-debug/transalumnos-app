let alumnos = JSON.parse(localStorage.getItem("alumnos")) || []

mostrarAlumnos()
actualizarDashboard()

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

function mostrarAlumnos(){

let lista = document.getElementById("lista")
lista.innerHTML=""

alumnos.forEach((a,i)=>{

let li = document.createElement("li")

li.innerHTML = `
<div class="card">

<h3>${a.nombre}</h3>

<p>📍 ${a.direccion}</p>

<p>${a.pago ? "🟢 Pagado" : "🔴 Pendiente"}</p>

<button onclick="whatsapp('${a.nombre}','${a.telefono}')">📱 Avisar</button>
<button onclick="marcarPago(${i})">💰</button>
<button onclick="editarAlumno(${i})">✏</button>
<button onclick="eliminarAlumno(${i})">🗑</button>

</div>
`

lista.appendChild(li)

})

}

function mostrarPagos(){

let lista = document.getElementById("listaPagos")
lista.innerHTML=""

alumnos.forEach((a,i)=>{

let li = document.createElement("li")

li.innerHTML = `
<div class="card">

<h3>${a.nombre}</h3>

<p>${a.pago ? "🟢 Pagado" : "🔴 Pendiente"}</p>

<button onclick="marcarPago(${i})">
💰 Cambiar estado
</button>

</div>
`

lista.appendChild(li)

})

}

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

function mostrar(pantalla){

document.getElementById("pantallaInicio").style.display="none"
document.getElementById("pantallaAlumnos").style.display="none"
document.getElementById("pantallaPagos").style.display="none"
document.getElementById("pantallaRuta").style.display="none"

document.getElementById(pantalla).style.display="block"

if(pantalla==="pantallaPagos") mostrarPagos()
if(pantalla==="pantallaRuta") mostrarRuta()

}

function guardarDatos(){
localStorage.setItem("alumnos", JSON.stringify(alumnos))
}

function whatsapp(nombre,telefono){

let mensaje = "Hola, estamos llegando por " + nombre

let url = "https://wa.me/54" + telefono + "?text=" + encodeURIComponent(mensaje)

window.open(url)

}

function eliminarAlumno(i){

if(confirm("¿Eliminar alumno?")){

alumnos.splice(i,1)

guardarDatos()
mostrarAlumnos()
actualizarDashboard()

}

}

function marcarPago(i){

alumnos[i].pago = !alumnos[i].pago

guardarDatos()
mostrarAlumnos()
actualizarDashboard()

}

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

function actualizarDashboard(){

let total = alumnos.length
let pagaron = alumnos.filter(a => a.pago).length
let pendientes = total - pagaron

document.getElementById("totalAlumnos").innerText = total
document.getElementById("totalPagaron").innerText = pagaron
document.getElementById("totalPendientes").innerText = pendientes

}
