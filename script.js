const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("jsonFiles");

let archivosGlobales = [];
let contenidoTXT = "";

function abrirSelector(){
  fileInput.click();
}

fileInput.addEventListener("change",(e)=>{

  archivosGlobales = Array.from(e.target.files)
  .filter(file => file.name.toLowerCase().endsWith(".json"));

  document.getElementById("contador").innerText =
  `${archivosGlobales.length} archivos seleccionados`;

});

["dragenter","dragover"].forEach(eventName => {

  uploadBox.addEventListener(eventName,(e)=>{
    e.preventDefault();
    uploadBox.classList.add("dragover");
  });

});

["dragleave","drop"].forEach(eventName => {

  uploadBox.addEventListener(eventName,(e)=>{
    e.preventDefault();
    uploadBox.classList.remove("dragover");
  });

});

uploadBox.addEventListener("drop",(e)=>{

  e.preventDefault();

  const files = Array.from(e.dataTransfer.files)
  .filter(file => file.name.toLowerCase().endsWith(".json"));

  archivosGlobales = files;

  document.getElementById("contador").innerText =
  `${files.length} archivos cargados`;

});

async function procesarArchivos(){

  if(archivosGlobales.length === 0){
    alert("Seleccione archivos JSON");
    return;
  }

  contenidoTXT = "";

  const progressContainer =
  document.getElementById("progressContainer");

  const progressFill =
  document.getElementById("progressFill");

  const progressPercent =
  document.getElementById("progressPercent");

  const statusText =
  document.getElementById("statusText");

  progressContainer.style.display = "block";

  for(let i=0; i<archivosGlobales.length; i++){

    const archivo = archivosGlobales[i];

    try{

      const texto = await archivo.text();
      const json = JSON.parse(texto);

      const numFactura =
      json.numFactura || "NO ENCONTRADO";

      const codigo =
      json.codigoUnicoValidacion || "NO ENCONTRADO";

      contenidoTXT +=
      `Archivo: ${archivo.name} | numFactura: ${numFactura} | codigoUnicoValidacion: ${codigo}\n`;

    }catch(error){

      contenidoTXT +=
      `Error procesando: ${archivo.name}\n`;

    }

    const porcentaje =
    Math.round(((i+1)/archivosGlobales.length)*100);

    progressFill.style.width = `${porcentaje}%`;

    progressPercent.innerText =
    `${porcentaje}%`;

    statusText.innerText =
    `Procesando ${i+1} de ${archivosGlobales.length} facturas`;

    await new Promise(resolve => setTimeout(resolve,20));
  }

  document.getElementById("resultado").value =
  contenidoTXT;

  document.getElementById("contador").innerText =
  `Facturas procesadas: ${archivosGlobales.length}`;

  statusText.innerText =
  "Procesamiento completado correctamente";

}

function descargarTXT(){

  if(!contenidoTXT){
    alert("No hay información");
    return;
  }

  const blob = new Blob([contenidoTXT],{
    type:"text/plain"
  });

  const enlace = document.createElement("a");

  enlace.href = URL.createObjectURL(blob);

  enlace.download = "resultado.txt";

  enlace.click();

}
function comenzarSistema(){

  const pantalla =
  document.getElementById("pantallaInicio");

  pantalla.classList.add("ocultar-inicio");

}
function descargarExcel(){

  if(archivosGlobales.length === 0){
    alert("No hay datos procesados");
    return;
  }

  let datosExcel = [];

  const lineas =
  contenidoTXT.trim().split("\n");

  lineas.forEach(linea => {

    if(linea.includes("numFactura")){

      const partes = linea.split("|");

      const archivo =
      partes[0].replace("Archivo:","").trim();

      const factura =
      partes[1].replace("numFactura:","").trim();

      const codigo =
      partes[2]
      .replace("codigoUnicoValidacion:","")
      .trim();

      datosExcel.push({
        Archivo: archivo,
        numFactura: factura,
        codigoUnicoValidacion: codigo
      });

    }

  });

  const worksheet =
  XLSX.utils.json_to_sheet(datosExcel);

  const workbook =
  XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Facturas"
  );

  XLSX.writeFile(
    workbook,
    "resultado_facturas.xlsx"
  );

}