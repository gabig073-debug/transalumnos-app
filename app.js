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

alumnos.forEach((a,i)=>{

let li = document.createElement("li")

li.innerHTML = `
<b>${a.nombre}</b><br>
${a.direccion}<br>

<button onclick="whatsapp('${a.telefono}')">
📱 Avisar
</button>

`

lista.appendChild(li)

})

}

function guardarDatos(){

localStorage.setItem("alumnos",JSON.stringify(alumnos))

}

function whatsapp(telefono){

let mensaje = "Hola, el transporte escolar llegará pronto."

let url = "https://wa.me/54"+telefono+"?text="+encodeURIComponent(mensaje)

window.open(url)

}