/* /////CREAR RESERVA//////
document.getElementById("reservationForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const startReservationDateTime = document.getElementById("startDateTime").value;
    const endDateTime = document.getElementById("endDateTime").value;
    const resourceId = parseInt(document.getElementById("resourceId").value);
    const title = document.getElementById("title").value;
    const allowParticipation = document.getElementById("allowParticipation").value;
    const termsAccepted = document.getElementById("termsAccepted").value;

    const accessories = [];
    for (let i = 1; i <= 4; i++) {
        const accessoryId = document.getElementById("accessory" + i).value;
        const quantityRequested = document.getElementById("quantity" + i).value;
    
        // Verifica que la cantidad solicitada sea mayor que 0
        if (parseInt(quantityRequested) > 0) {
            accessories.push({ accessoryId: parseInt(accessoryId), quantityRequested: parseInt(quantityRequested) });
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
        termsAccepted: termsAccepted
    };
    console.log(reservationData);
    // Realizar la solicitud POST a la API
    fetch("http://localhost:8080/Web/Services/index.php/Reservations/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'X-Booked-SessionToken': 'de052222d41fe3bf8085e65e94ce02fed73da80a304afe316f',
            'X-Booked-UserId': '1'
        },
        body: JSON.stringify(reservationData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}
);

//ventana modal
var modal = document.getElementById("myModal");
var btn = document.getElementById("confirmReservation");

//Ponemos el eventListener al boton de confirmar reserva
document.getElementById("confirmReservation").addEventListener("click", function() {
    modal.style.display = "block";
});

//Listener para cerrar Modal
document.getElementById("closeModal").addEventListener("click", function() {
    modal.style.display = "none";
}); */