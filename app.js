let alumnos = JSON.parse(localStorage.getItem("alumnos")) || [];

mostrarAlumnos();

function agregarAlumno(){
let nombre = document.getElementById("nombre").value;
let direccion = document.getElementById("direccion").value;
let telefono = document.getElementById("telefono").value;

let alumno = {
nombre,
direccion,
telefono,
pago:false
};

alumnos.push(alumno);

guardarDatos();
mostrarAlumnos();

document.getElementById("nombre").value = "";
document.getElementById("direccion").value = "";
document.getElementById("telefono").value = "";
}

function mostrarAlumnos(){
let lista = document.getElementById("lista");
lista.innerHTML = "";

alumnos.forEach((a,i)=>{
let li = document.createElement("li");

li.innerHTML = `
<div class="card">
<h3>${a.nombre}</h3>
<p>📍 ${a.direccion}</p>
<p>${a.pago ? "🟢 Pagado" : "🔴 Pendiente"}</p>

<button onclick="whatsapp('${a.telefono}')">📱 Avisar</button>
<button onclick="marcarPago(${i})">💰 ${a.pago ? "Quitar pago" : "Marcar pagado"}</button>
<button onclick="editarAlumno(${i})">✏ Editar</button>
<button onclick="eliminarAlumno(${i})">🗑 Eliminar</button>
</div>
`;

lista.appendChild(li);
});
}

function guardarDatos(){
localStorage.setItem("alumnos", JSON.stringify(alumnos));
}

function whatsapp(telefono){
let mensaje = "Hola, el transporte escolar llegará pronto.";
let url = "https://wa.me/54" + telefono + "?text=" + encodeURIComponent(mensaje);
window.open(url);
}

function eliminarAlumno(i){
if(confirm("¿Eliminar alumno?")){
alumnos.splice(i,1);
guardarDatos();
mostrarAlumnos();
}
}

function marcarPago(i){
alumnos[i].pago = !alumnos[i].pago;
guardarDatos();
mostrarAlumnos();
}

function editarAlumno(i){
let nuevoNombre = prompt("Nombre", alumnos[i].nombre);
let nuevaDireccion = prompt("Dirección", alumnos[i].direccion);
let nuevoTelefono = prompt("Teléfono", alumnos[i].telefono);

if(nuevoNombre){
alumnos[i].nombre = nuevoNombre;
alumnos[i].direccion = nuevaDireccion;
alumnos[i].telefono = nuevoTelefono;

guardarDatos();
mostrarAlumnos();
}
}
