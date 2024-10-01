async function ajoutListenerConnexion() {
    const formulaireConnexion = document.querySelector("#formulaire-login");
    formulaireConnexion.addEventListener("submit", async (event) => {
            event.preventDefault();
            // Objet de connexion
            const connexion = {
                email: document.querySelector("#email").value,
                password: document.querySelector("#password").value
            };
            // Création charge utile 
            const chargeUtile = JSON.stringify(connexion);

            try {
                // fetch 
                const reponse = await fetch("http://localhost:5678/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: chargeUtile
                });

                //vérif validité email/password
                if (reponse.ok) {
                    const data = await reponse.json();
                    sessionStorage.setItem('auth-token', data.token);
                    window.location.href = "index.html";
                } else {
                    // Afficher message d'erreur
                    afficherMessageErreur("Erreur dans l’identifiant ou le mot de passe");
                }
            } catch (error) {
                afficherMessageErreur("Une erreur est survenue lors de la tentative de connexion au serveur");

            }
        });  
}

// Afficher le message d'erreur - ds fonction précédente
function afficherMessageErreur(message) {
    const messageErreur = document.querySelector("#message-erreur");
    messageErreur.innerText = message;
    messageErreur.style.display = "block"; // Rendre le message visible
}

ajoutListenerConnexion();