async function getBuilding(edificioId) {
  function obtenerDateTimeGet(isStart) {
    const fecha = new Date();
    const offset = isStart ? 0 : 6; // 0 para inicio, 6 para fin
    fecha.setDate(fecha.getDate() + offset);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    const dateTimeGet = `${año}/${mes}/${dia}T00:00:00`;

    return dateTimeGet;
  }
  const startDateTimeGet = obtenerDateTimeGet(true);
  const endDateTimeGet = obtenerDateTimeGet(false);

  console.log(startDateTimeGet);
  console.log(endDateTimeGet);

  function convertirFecha(inputFecha) {
    const fecha = new Date(inputFecha);
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${año}-${mes}-${dia}`;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/Web/Services/index.php/Schedules/${edificioId}/Slots?startDateTime=${startDateTimeGet}&endDateTime=${endDateTimeGet}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Booked-SessionToken":
            "3f038fac440d3521b569493a5b5340fb50335c6028c3d5c9ef",
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

  // Agregar las nuevas opciones al select de horas
  horasDisponibles.forEach((slot) => {
    const option = document.createElement("option");
    const formattedTime = slot.startDateTime.split("T")[1].substring(0, 5); // Extraer hh:mm de la cadena
    option.value = slot.slotId;
    option.innerText = formattedTime;
    horaSelect.appendChild(option);
  });
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



getBuilding(1);

/////CREAR RESERVA//////
document
  .getElementById("reservationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const description = document.getElementById("description").value;
    const startReservationDateTime =
      document.getElementById("startDateTime").value;
    const endDateTime = document.getElementById("endDateTime").value;
    const title = document.getElementById("title").value;
    const allowParticipation =
      document.getElementById("allowParticipation").value;
    const termsAccepted = document.getElementById("termsAccepted").value;
    const resourceId = parseInt(document.getElementById("resourceId").value);

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
          "3f038fac440d3521b569493a5b5340fb50335c6028c3d5c9ef",
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
