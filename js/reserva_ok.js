async function getBuilding(edificioId) {
  
  function obtenerFechaActual(isStart) {
    const fecha = new Date();
    const offset = isStart ? 0 : 6; // 0 para inicio, 6 para que devuelva la fecha de 6 días después
    fecha.setDate(fecha.getDate() + offset);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    const dateTimeGet = `${año}/${mes}/${dia}T00:00:00`;

    return dateTimeGet; //aquí devolvemos la fecha actual en formato yyyy/mm/ddThh:mm:ss
  }
  const startDateTimeGet = obtenerFechaActual(true); //fecha inicio
  const endDateTimeGet = obtenerFechaActual(false); //fecha fin (6 días después)

  try {
    const response = await fetch(
      `http://localhost:8080/Web/Services/index.php/Schedules/${edificioId}/Slots?startDateTime=${startDateTimeGet}&endDateTime=${endDateTimeGet}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Booked-SessionToken":
            "771740c791fc7f1c91748d4606b0e89dc9baf917ed38e6b3a3",
          "X-Booked-UserId": "1",
        },
      }
    );
    if (!response.ok) {
      throw new Error(
        `Error en la solicitud: Código de estado ${response.status}`
      );
    }
    const building = await response.json();
    console.log("buildingActual", building);
    actualizarTitulo(edificioId);

    if (building && building.dates.length > 0) {
      procesarFechasYRecursos(building);
    } else {
      throw new Error('No se encontraron datos para el edificio con ID ${edificioId}'); //si no hay datos para el edificio, lanza un error
    }

    return building;
  } catch (error) {
    console.error("Error en getBuilding:", error);
    throw error;
  }
}

function convertirFecha(inputFecha) { //Necesario para convertir la fecha que llega de la API
  const fecha = new Date(inputFecha);
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${año}-${mes}-${dia}`; //aquí convertimos la fecha al formato yyyy-mm-dd para poder mostrarla en el input
}

function actualizarTitulo(edificioId) {
  const titulo = document.getElementById("salaActual");

  switch (edificioId) {
    case 1:
      titulo.innerText = "C.C. Bellavista";
      break;
    case 2:
      titulo.innerText = "Espacio Santa Clara";
      break;
    default:
      titulo.innerText = "Edificio Desconocido";
  }
}

function mostrarHorasDisponibles(e, date) {
  // Limpiar las opciones actuales del select de horas
  const horaSelect = document.getElementById("hora");
  horaSelect.innerHTML = '<option value="" selected disabled>Selecciona una hora</option>';
  
  // Obtener el valor seleccionado del select de resourceId
  const selectedResourceId = e.target.value;
  
  //obtener hora actual para comparar con las horas disponibles
  const horaActual = new Date()
  
  // Buscar las horas disponibles para la sala seleccionada
  const horasDisponibles = date.resources.find(
  (resource) => resource.resourceId === selectedResourceId
  ).slots.filter((slot) => {
  const startDateTime = new Date(slot.startDateTime);
  return slot.isReservable && startDateTime > horaActual;
  });
  
  // Agregar las nuevas opciones al select de horas
  horasDisponibles.forEach((slot) => {
  const option = document.createElement("option");
  const formattedTime = slot.startDateTime.split("T")[1].substring(0, 5); // Extraer hh:mm de la cadena
  option.value = slot.startDateTime;
  option.dataset.endDateTime = slot.endDateTime; // Guardar la fecha de fin en un atributo personalizado del elemento
  option.innerText = formattedTime;
  horaSelect.appendChild(option);
  });
  
  //Actualizar el valor del input de endDateTime
  horaSelect.addEventListener('change', function() {
  const selectedOption = this.options[this.selectedIndex];
  const endDateTime = selectedOption.dataset.endDateTime; // Recupera el endDateTime del dataset
  document.getElementById('endDateTime').value = endDateTime; // Actualiza el valor del input oculto
  //console.log("endDateTimeInput",endDateTime);
  });
  }

function procesarFechasYRecursos(building) {
  let firstDate = building.dates[0];
  const firstFecha = firstDate.date; //primera fecha devuelta por la API

  // Listener en el campo Date + Mostrar la primera fecha en el input de fecha
  const startDateTimeInput = document.getElementById("startDateTime");
  startDateTimeInput.value = convertirFecha(firstFecha); //convierte la primera fecha al formato yyyy-mm-dd para mostrarla en el input
  startDateTimeInput.addEventListener("change", (e) => { 
  //Busca la fecha seleccionada en el array de fechas devuelto por la API -que devuelve los primeros 7 desde la fecha actual-
  const nuevaFecha = e.target.value; 
  firstDate = building.dates.find((date) => date.date.split("T")[0] === nuevaFecha);
  mostrarHorasDisponibles({ target: resourceIdSelect }, firstDate);
});

  // Listener en el select + Mostrar nombres salas en las opciones del select
  const resourceIdSelect = document.getElementById("resourceId");
  resourceIdSelect.addEventListener("change",(e)=> mostrarHorasDisponibles(e,firstDate));

  firstDate.resources.forEach((resource, resourceIndex) => {
    const resourceName = resource.resourceName;
    const resourceId = resource.resourceId;

    const option = document.createElement("option");
    option.value = resourceId;
    option.innerText = resourceName;
    document.getElementById("resourceId").appendChild(option); 
  });

}

getBuilding(2);

/////CREAR RESERVA//////
document.getElementById('quantity1').addEventListener('change', function() { //Neesario que esté fuera del evento submit para que se actualie el valor del checkbox
  this.value = this.checked ? '1' : '0';
  //console.log('Valor del checkbox:', this.value);
});

document
  .getElementById("reservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const resourceId = parseInt(document.getElementById("resourceId").value);
    const startReservationTime = document.getElementById("hora").value;
    const endReservationTime = document.getElementById("endDateTime").value;
    
    const attributeId = document.getElementById("attributeId").value;
    const attributeValue = document.getElementById("attributeValue").value;
    const customAttributes = [
      {
        attributeId: parseInt(attributeId),
        attributeValue: attributeValue,
      },
    ];

    const description = document.getElementById("description").value;
    const title = document.getElementById("title").value;
    

    const allowParticipation = document.getElementById("allowParticipation").value;

    const termsAccepted = document.getElementById("termsAccepted").checked;
    if(!termsAccepted){
      alert("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    const accessories = [];
    for (let i = 1; i <= 4; i++) {
      const accessoryId = document.getElementById("accessory" + i).value;
      const quantityRequested = document.getElementById("quantity" + i).value;

      // Verifica que la cantidad solicitada sea mayor que 0 y agregar al array solamente los accesorios que se solicitaron
      if (parseInt(quantityRequested) > 0) {
        accessories.push({
          accessoryId: parseInt(accessoryId),
          quantityRequested: parseInt(quantityRequested),
        });
      }
    }

    const reservationData = {
      accessories: accessories,
      description: description,
      startDateTime: startReservationTime,
      endDateTime: endReservationTime,
      resourceId: resourceId,
      customAttributes: customAttributes,
      title: title,
      userId: 1,
      allowParticipation: allowParticipation,
      termsAccepted: termsAccepted,
    };
    console.log(reservationData);

    // Realizar la solicitud POST a la API
    fetch("http://localhost:8080/Web/Services/index.php/Reservations/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Booked-SessionToken":
          "771740c791fc7f1c91748d4606b0e89dc9baf917ed38e6b3a3",
        "X-Booked-UserId": "1",
      },
      body: JSON.stringify(reservationData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.message === "The reservation was created") {
          // Muestra la ventana modal
          modal.style.display = "block";
        } else if (
          data.message === "There were errors processing your request"
        ) {
          alert("Erro al crear la reserva. Revisa los campos.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Tu reserva no pudo ser creada en este momento");
      });
  });

//ventana modal
let modal = document.getElementById("myModal");

//Listener para cerrar Modal
document.getElementById("closeModal").addEventListener("click", function () {
  modal.style.display = "none";
  document.getElementById("reservationForm").reset();
});