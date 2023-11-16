async function getBuilding(edificioId) {
  
  function obtenerFechaActual(isStart) {
    const fecha = new Date();
    const offset = isStart ? 0 : 6; // 0 para inicio, 6 para fin
    fecha.setDate(fecha.getDate() + offset);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    const dateTimeGet = `${año}/${mes}/${dia}T00:00:00`;

    return dateTimeGet; //aquí devolvemos la fecha actual en formato yyyy/mm/ddThh:mm:ss
  }
  const startDateTimeGet = obtenerFechaActual(true); 
  const endDateTimeGet = obtenerFechaActual(false);

  function convertirFecha(inputFecha) {
    const fecha = new Date(inputFecha);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`; //aquí convertimos la fecha al formato yyyy-mm-dd para poder mostrarla en el input
  }

  try {
    const response = await fetch(
      `http://localhost:8080/Web/Services/index.php/Schedules/${edificioId}/Slots?startDateTime=${startDateTimeGet}&endDateTime=${endDateTimeGet}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Booked-SessionToken":
            "46c566ad7c8df48da0d682a354c337df485a4303136cfc370a",
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
      const firstDate = building.dates[0];
      const firstFecha = firstDate.date;

      // Mostrar la primera fecha en el input de fecha
      const startDateTimeInput = document.getElementById("startDateTime");
      startDateTimeInput.value = convertirFecha(firstFecha);
      /* document.getElementById("endDateTime").value = convertirFecha(firstFecha); */

      // Mostrar nombres de salas para la primera fecha en el select de salas
      firstDate.resources.forEach((resource, resourceIndex) => {
        const resourceName = resource.resourceName;
        const resourceId = resource.resourceId;

        const option = document.createElement("option");
        option.value = resourceId;
        option.innerText = resourceName;
        document.getElementById("resourceId").appendChild(option);
      });

      //Agregar un listener al cambio de fecha
      startDateTimeInput.addEventListener("change", actualizarHoras);

      // Agrega un evento de cambio al select de resourceId
const resourceIdSelect = document.getElementById("resourceId");
resourceIdSelect.addEventListener("change", mostrarHorasDisponibles);

function mostrarHorasDisponibles() {
  // Limpiar las opciones actuales del select de horas
  const horaSelect = document.getElementById("hora");
  horaSelect.innerHTML = '<option value="" selected disabled>Selecciona una hora</option>';

  // Obtener el valor seleccionado del select de resourceId
  const selectedResourceId = resourceIdSelect.value;

  // Buscar las horas disponibles para la sala seleccionada
  const horasDisponibles = building.dates[0].resources.find(
    (resource) => resource.resourceId === selectedResourceId
  ).slots.filter((slot) => slot.isReservable);
  console.log("horasDisponibles", horasDisponibles);

  // Agregar las nuevas opciones al select de horas
  horasDisponibles.forEach((slot) => {
    const option = document.createElement("option");
    const formattedTime = slot.startDateTime.split("T")[1].substring(0, 5); // Extraer hh:mm de la cadena
    option.value = slot.slotId;
    option.innerText = formattedTime;
    horaSelect.appendChild(option);
  });
}

function actualizarHoras() {
  try {
    // Obtener la nueva fecha del input
    let nuevaFecha = document.getElementById("startDateTime").value;
    nuevaFecha = `${nuevaFecha}T00:00:00+0100`;

    // Limpiar las opciones actuales del select de horas
    const horaSelect = document.getElementById("hora");
    horaSelect.innerHTML = '<option value="" selected disabled>Selecciona una hora</option>';

    // Obtener el valor seleccionado del select de resourceId
    const selectedResourceId = resourceIdSelect.value;

    // Buscar las horas disponibles para la sala y la nueva fecha seleccionada
    const dateData = building.dates.find(
      (date) => date.date === nuevaFecha
    );

    if (dateData && dateData.resources) {
      const resource = dateData.resources.find(
        (resource) => resource.resourceId === selectedResourceId
      );

      if (resource && resource.slots) {
        const horasDisponibles = resource.slots.filter((slot) => slot.isReservable);

        // Agregar las nuevas opciones al select de horas
        horasDisponibles.forEach((slot) => {
          const option = document.createElement("option");
          const formattedTime = slot.startDateTime.split("T")[1].substring(0, 5); // Extraer hh:mm de la cadena
          option.value = slot.slotId;
          option.innerText = formattedTime;
          horaSelect.appendChild(option);
        });
      } else {
        console.warn(`No hay información disponible para la sala y fecha seleccionadas`);
      }
    } else {
      console.warn(`No hay información disponible para la fecha ${nuevaFecha}`);
    }
  } catch (error) {
    console.error("Error al actualizar horas:", error);
  }
}
      return building;
    } else {
      throw new Error(
        `No se encontraron datos para el edificio con ID ${edificioId}`
      );
    }
  } catch (error) {
    console.error("Error en getBuilding:", error);
    throw error;
  }
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



getBuilding(2);


/* const duracionReserva = building.dates[0].resources[0].slots.filter(slot => slot.isReservable);
const horasDisponibles = building.dates[0].resourcesslots.filter((slot) => slot.isReservable); */



/////CREAR RESERVA//////
document
  .getElementById("reservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const resourceId = parseInt(document.getElementById("resourceId").value);
    const startReservationDateT = document.getElementById("startDateTime").value;
    const startReservationTime = document.getElementById("hora").value;
    const startReservationDateTime = `${startReservationDateT}T${startReservationTime}:00+0100`;
    const endDateTime = document.getElementById("endDateTime").value;
    
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
    const termsAccepted = document.getElementById("termsAccepted").value;
    

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
      startDateTime: startReservationDateTime,
      endDateTime: endDateTime,
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
          "46c566ad7c8df48da0d682a354c337df485a4303136cfc370a",
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
