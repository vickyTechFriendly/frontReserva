async function getBuilding(edificioId) {
const startDateTimeGet = '2023-11-13T00:00:00';
const endDateTimeGet = '2023-11-18T00:00:00';
    try {
        const response = await fetch(`http://localhost:8080/Web/Services/index.php/Schedules/${edificioId}/Slots?startDateTime=${startDateTimeGet}&endDateTime=${endDateTimeGet}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Booked-SessionToken': '250f76da0b7eeaeb778da91b3f896ba989e664a1918a83564b',
            'X-Booked-UserId': '1'
        }
    });

    if (!response.ok) {
        throw new Error(`Error en la solicitud: Código de estado ${response.status}`);
    }

    let data = await response.json();
    console.log( "función getBuilding",data);
    if (data) {
        return data;
    } else {
        throw new Error(`No se encontraron datos para el edificio con ID ${edificioId}`);
    }
} catch (error) {
    console.error('Error en getBuilding:', error);
    throw error; 
}
}

function renderBuilding(building) {
    let resultado = document.getElementById("finalResults");
    // Creación tabla 
    let table = document.createElement("table");
    table.classList.add("availability-table");

    // Encabezado con el "Sala"
    let headerRow = document.createElement("tr");
    let headerCell = document.createElement("th");
    headerCell.innerText = "Sala";
    headerRow.appendChild(headerCell);

    const allWeek = building.dates.flatMap(date => date.resources); 
    console.log("allWeek",allWeek);

    allHours = allWeek[0].slots.filter( //Aquí está filtrando los slots de la primera sala el primer día
        (slot) => slot.isReservable || slot.isReserved
    );
    console.log("allHours",allHours);

    allHours.forEach((slot) => {
        let headerCell = document.createElement("th");
        let startTime = new Date(slot.startDateTime);
        let endTime = new Date(slot.endDateTime);
        headerCell.innerText = `${startTime.toLocaleTimeString([], { hour: '2-digit' })}`;
        headerRow.appendChild(headerCell);
    });

    table.appendChild(headerRow);
    
    building.dates.forEach((date, dateIndex) => {
        date.resources.forEach((resource, resourceIndex) => {
            const resourceName = resource.resourceName;

            if (resourceIndex === 0) {
                let dateRow = document.createElement("tr");
                dateRow.classList.add("fechasDispo");
                let dateCell = document.createElement("td");
                let dateValue = new Date(date.date);
                dateCell.innerText = dateValue.toLocaleDateString();
                dateCell.colSpan = allHours.length + 1;
                dateRow.appendChild(dateCell);
                table.appendChild(dateRow);
            }

            let row = document.createElement("tr");
            let cell = document.createElement("td");
            cell.innerText = resourceName;
            row.appendChild(cell);

            allHours.forEach((slot) => {
                if (slot.isReservable || slot.isReserved) {
                    let cell = document.createElement("td");
                    cell.innerText = '';
                    cell.style.color = slot.isReservable ? '#82B387' : '#BD6B68';
                    cell.style.backgroundColor = slot.isReservable ? '#82B387' : '#BD6B68';
                    row.appendChild(cell);
                }
            });

            table.appendChild(row);
        });
    });
    resultado.appendChild(table);
    }

async function createBuilding() {
    const building = await getBuilding(2);
    if (building) {
        renderBuilding(building);
    }
}

createBuilding();

/////CREAR RESERVA//////
document.getElementById("reservationForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    //Restarle 1h a la fecha de inicio de la reserva
    const startReservationDateTime = document.getElementById("startDateTime").value;
    const endDateTime = document.getElementById("endDateTime").value;
    //Restarle 1h a la fecha de fin de la reserva
    const title = document.getElementById("title").value;
    const allowParticipation = document.getElementById("allowParticipation").value;
    const termsAccepted = document.getElementById("termsAccepted").value;
    const resourceId = parseInt(document.getElementById("resourceId").value);

    const accessories = [];
    for (let i = 1; i <= 4; i++) {
        const accessoryId = document.getElementById("accessory" + i).value;
        const quantityRequested = document.getElementById("quantity" + i).value;
    
        // Verifica que la cantidad solicitada sea mayor que 0 y agregar al array solamente los accesorios que se solicitaron
        if (parseInt(quantityRequested) > 0) {
            accessories.push({ accessoryId: parseInt(accessoryId), quantityRequested: parseInt(quantityRequested) });
        }
    }

    const reservationData = {
        accessories: accessories,
        description: description,
        startDateTime: startReservationDateTime,
        endDateTime: endDateTime,
        resourceId: 7,
        title: title,
        userId: 1, 
        allowParticipation: allowParticipation,
        termsAccepted: termsAccepted
    };
    console.log(reservationData);

    // Realizar la solicitud POST a la API
    fetch("http://localhost:8080/Web/Services/index.php/Reservations/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-Booked-SessionToken': '250f76da0b7eeaeb778da91b3f896ba989e664a1918a83564b',
            'X-Booked-UserId': '1'
        },
        body: JSON.stringify(reservationData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.message === "The reservation was created") {
            // Muestra la ventana modal
            modal.style.display = "block";
        } else if (data.message === "There were errors processing your request") {
            // Muestra una alerta en caso de errores
            alert("Erro al crear la reserva. Revisa los campos.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Tu reserva no pudo ser creada en este momento");
    });
});

//ventana modal
let modal = document.getElementById("myModal");

//Listener para cerrar Modal
document.getElementById("closeModal").addEventListener("click", function() {
    modal.style.display = "none";
    document.getElementById("reservationForm").reset();
});

