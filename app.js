let alumnos = JSON.parse(localStorage.getItem("alumnos")) || []

mostrarAlumnos()

function agregarAlumno(){

let nombre = document.getElementById("nombre").value
let direccion = document.getElementById("direccion").value
let telefono = document.getElementById("telefono").value

let alumno = {
nombre,
direccion,
telefono
}

alumnos.push(alumno)

guardarDatos()

mostrarAlumnos()

}

function mostrarAlumnos(){

let lista = document.getElementById("lista")

lista.innerHTML = ""

alumnos.forEach((a)=>{

let li = document.createElement("li")

li.innerHTML = `
<div class="card">

<h3>${a.nombre}</h3>

<p>📍 ${a.direccion}</p>

<button onclick="whatsapp('${a.telefono}')">
📱 Avisar
</button>

</div>
`

lista.appendChild(li)

})

}

function guardarDatos(){

localStorage.setItem("alumnos", JSON.stringify(alumnos))

}

function whatsapp(telefono){

let mensaje = "Hola, el transporte escolar llegará pronto."

let url = "https://wa.me/54" + telefono + "?text=" + encodeURIComponent(mensaje)

window.open(url)

}
