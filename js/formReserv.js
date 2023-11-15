function formulario() {
    const salaSelect = document.getElementById("salas");
    const diaDiv = document.getElementById("paso2");
    const horaDiv = document.getElementById("paso3");
    const participantesDiv = document.getElementById("paso4");
    const solicitanteDiv = document.getElementById("paso5");
    const emailDiv = document.getElementById("paso6");
    const telefonoDiv = document.getElementById("paso7");
    const observaDiv = document.getElementById("paso8");
    const reservarBtn = document.getElementById("reservarBtn");
    
    salaSelect.addEventListener("change", () => {
        diaDiv.style.display = "block";
    });

    document.getElementById("dia").addEventListener("change", () => {
        horaDiv.style.display = "block";
    });

    document.getElementById("hora").addEventListener("change", () => {
        participantesDiv.style.display = "block";
    });

    document.getElementById("participantes").addEventListener("change", () => {
        solicitanteDiv.style.display = "block";
        emailDiv.style.display = "block";
        telefonoDiv.style.display = "block";
        observaDiv.style.display = "block";
        reservarBtn.style.display = "block";

    });
    const sala = salaSelect.value;
        const dia = document.getElementById("dia").value;
        const hora = document.getElementById("hora").value;
        const participa = document.getElementById("participantes").value;
        const solicitante = document.getElementById("solicitante").value;
        const email = document.getElementById("email").value;
        const telefono = document.getElementById("telefono").value;

        // Verificar que todos los campos requeridos estén completos
        if (sala && dia && hora && participa && solicitante && email && telefono) {
            reservarBtn.style.display = "block";
        } else {
            reservarBtn.style.display = "none";
        }

    // Escuchar eventos de cambio en los campos
    salaSelect.addEventListener("change", verificarCamposCompletos);
    document.getElementById("dia").addEventListener("change", verificarCamposCompletos);
    document.getElementById("hora").addEventListener("change", verificarCamposCompletos);
    document.getElementById("participantes").addEventListener("input", verificarCamposCompletos);
    document.getElementById("solicitante").addEventListener("input", verificarCamposCompletos);
    document.getElementById("email").addEventListener("input", verificarCamposCompletos);
    document.getElementById("telefono").addEventListener("input", verificarCamposCompletos);
    document.getElementById("observaciones").addEventListener("textarea", verificarCamposCompletos);

reservarBtn.addEventListener("click", (e) => {
e.preventDefault(); 
mostrarModal();
});

function mostrarModal() {
const modal = document.getElementById("myModal");
const span = document.querySelector(".close");

modal.style.display = "block";

// Cuando se hace clic en la 'x', cierra la ventana modal
span.onclick = function() {
    modal.style.display = "none";
}

// Cuando se hace clic fuera de la ventana modal, ciérrala
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
}
}

formulario();