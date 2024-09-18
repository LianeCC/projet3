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

            // fetch 
            const reponse = await fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: chargeUtile
            });

            //vérif validité email/password
            if (reponse.ok) {
                const data = await reponse.json();
                localStorage.setItem('auth-token', data.token);
                console.log(localStorage.getItem('authToken'));
                window.location.href = "index.html";
            } else {
                // Afficher message d'erreur
                afficherMessageErreur("Erreur dans l’identifiant ou le mot de passe");
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


export function afficherBoutonConnexion() {
    const boutonConnexion = document.querySelector("#login-logout");
    if (localStorage.getItem('auth-token')) {
        // connexion validée, changement du texte
        boutonConnexion.textContent = "logout" ;
        boutonConnexion.setAttribute("href", "#");
        // affichage bannerEditionMode 
        const bannerEditionMode = document.querySelector(".bannerEditionMode");
        bannerEditionMode.style.display = "flex";
        
        // Suppression des boutons
        const boutons = document.querySelectorAll(".boutons button");
        boutons.forEach(bouton => {
            bouton.remove();
        });

        // affichage encart Modifier à côté de Mes Projets
        const bannerModifier = document.querySelector(".bannerModifier");
        bannerModifier.style.display = "flex";

        // gestion modale pour ajout projet 
        let modale = null; 

        // ouverture de la modale
        const openModal = function (event) {
            event.preventDefault;
            const target = document.querySelector(event.target.getAttribute("href"));
            target.style.display = null;
            target.removeAttribute("aria-hidden");
            target.setAttribute("aria-modal", "true");
            modale = target;
            modale.addEventListener("click", closeModal);
            modale.querySelector(".fermerModale").addEventListener("click", closeModal);
            modale.querySelector(".modal-stop").addEventListener("click", stopPropagation);
        }

        
        // fermeture de la modale
        const closeModal = function (event) {
            if (modale === null) return;
            event.preventDefault()
            modale.style.display="none";
            modale.setAttribute("aria-hidden", "true");
            modale.removeAttribute("aria-modal");
            modale.removeEventListener("click", closeModal);
            modale.querySelector(".fermerModale").removeEventListener("click", closeModal);
            modale.querySelector(".modal-stop").removeEventListener("click", stopPropagation);
            modale = null;
        }
        const stopPropagation = function (event) {
            event.stopPropagation();            
        }

        // appel de la fonction ouverture modale
        document.querySelectorAll(".boutonModifier").forEach(a => {
            a.addEventListener("click", openModal);
        })

        // listener pour deconnexion utilisateur
        boutonConnexion.addEventListener("click", () => {
            localStorage.removeItem('auth-token');
            window.location.href = "index.html";
        });
    } 
}

afficherBoutonConnexion();


