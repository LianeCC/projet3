// ****** CONNEXION UTILISATEUR 
function afficherBoutonConnexion() {
    const boutonConnexion = document.querySelector("#login-logout");
    if (localStorage.getItem("auth-token")) {
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

        // listener pour deconnexion utilisateur
        boutonConnexion.addEventListener("click", () => {
            localStorage.removeItem("auth-token");
            window.location.href = "index.html";
        });

        // affichage encart Modifier à côté de Mes Projets
        const bannerModifier = document.querySelector(".bannerModifier");
        bannerModifier.style.display = "flex";
    } 
}

//appel fonction connexion
window.onload = () => {
    afficherBoutonConnexion();
};

// ***** AFFICHAGE PROJET SUR PAGE D'ACCUEIL
// Récupération des projets réalisés depuis l'API
const reponseProjets = await fetch("http://localhost:5678/api/works");
const projets = await reponseProjets.json();

// création des projets 
function genererProjet(projets) {
    const sectionFiches = document.querySelector(".gallery");
    sectionFiches.innerHTML = ""; // vide la section avant de la remplir

    for (let i = 0; i < projets.length; i++) {
        const fiche = projets[i]; 
        // création de la balise pour une fiche 
        const projetElement = document.createElement("figure");
        projetElement.setAttribute("data-id", fiche.id) //ID pour gérer la suppression projet
        // création des 2 balises dans les fiches
        const imageElement = document.createElement("img");
        imageElement.src = fiche.imageUrl;
        const figCaptionElement = document.createElement("figcaption")
        figCaptionElement.innerText = fiche.title;

        // rattache les balises aux éléments parents 
        sectionFiches.appendChild(projetElement);
        projetElement.appendChild(imageElement);
        projetElement.appendChild(figCaptionElement);
    }
}

genererProjet(projets);

// GESTION DES BOUTONS FILTRES 
// enlever selected de tous les boutons
function retirerSelectionBoutons() {
    const boutons = document.querySelectorAll(".boutons button");
    boutons.forEach(bouton => bouton.classList.remove("selected"));
}

// Récupération des catégories depuis l'API
const reponseCategories = await fetch("http://localhost:5678/api/categories");
const categories = await reponseCategories.json();

function genererBouton(categories) {
    const emplacementBoutons = document.querySelector(".boutons");

    //si utilisateur non connecté alors boutons : 
    if (!localStorage.getItem("auth-token")) {

        // Création du bouton "Tous"
        const boutonTous = document.createElement("button");
        boutonTous.innerHTML = "Tous";
        boutonTous.classList.add("selected");
        emplacementBoutons.appendChild(boutonTous);

        // Ajout d'un EventListener pour afficher tous les projets
        boutonTous.addEventListener("click", () => {
            genererProjet(projets);
            // update du style du bouton
            retirerSelectionBoutons();
            boutonTous.classList.add("selected");
        });

        // Création des boutons par catégorie
        for (let index = 0; index < categories.length; index++) {
            const categorie = categories[index];
            const boutonElement = document.createElement("button");
            boutonElement.innerHTML = categorie.name;
            boutonElement.dataset.id = categorie.id;

            // Ajout d'un EventListener pour filtrer par catégorie
            boutonElement.addEventListener("click", () => {
                const projetsFiltres = projets.filter(projet => projet.categoryId === categorie.id);
                document.querySelector(".gallery").innerHTML = "";
                genererProjet(projetsFiltres);
                // update du style du bouton
                retirerSelectionBoutons();
                boutonElement.classList.add("selected");
            });

            // rattache les boutons à l'élément parent
            emplacementBoutons.appendChild(boutonElement);
        }
    }
}
//appel fonction création boutons
genererBouton(categories);


// ***** GESTION MODALE POUR MODIFICATION PROJETS
let modale = null; 

// ouverture de la modale
const openModal = function (event) {
    event.preventDefault();
    const target = document.querySelector(event.target.getAttribute("href"));
    target.style.display = null;
    target.removeAttribute("aria-hidden");
    target.setAttribute("aria-modal", "true");
    modale = target;
    modale.addEventListener("click", closeModal);
    // Event pour la fermeture de la modale pour chaque vue
    const fermerModaleButtons = modale.querySelectorAll(".fermerModale");
    fermerModaleButtons.forEach(button => {
        button.addEventListener("click", closeModal);
    });
    modale.querySelector(".modal-stop").addEventListener("click", stopPropagation);
}

// fermeture de la modale
const closeModal = function (event) {
    if (modale === null) return;
    event.preventDefault();
    backToModal1(); // retour à la vue initiale si on est sur la vue 2
    modale.style.display="none";
    modale.setAttribute("aria-hidden", "true");
    modale.removeAttribute("aria-modal");
    modale.removeEventListener("click", closeModal);
    modale.querySelector(".fermerModale").removeEventListener("click", closeModal);
    modale.querySelector(".modal-stop").removeEventListener("click", stopPropagation);
    modale = null;
}
//limiter la fermeture de la modale aux éléments enfants
const stopPropagation = function (event) {
    event.stopPropagation();            
}

// ouverture modale depuis le bouton Modifier
document.querySelectorAll(".boutonModifier").forEach(a => {
    a.addEventListener("click", openModal);
})

// ouverture de la seconde vue     
function openModal2 () {
    const viewModale1 = document.querySelector(".vuemodale1");
    viewModale1.style.display = "none";
    const viewModale2 = document.querySelector(".vuemodale2");
    viewModale2.style.display = null;
    const backArrow = document.querySelector(".retourvue1");
    backArrow.style.display = null; 
    chargerCategories();
}

const addProject = document.querySelector(".ajout-projet");
addProject.addEventListener("click", openModal2);


// Récupérer les catégories dynamiquement depuis l'API
async function chargerCategories() {
    const selectCategory = document.getElementById("category");
    selectCategory.innerHTML = "";    
    categories.forEach(categorie => {
                const option = document.createElement("option");
                option.value = categorie.id;
                option.textContent = categorie.name;
                selectCategory.appendChild(option);
        });
}

// retour à la première vue 
function backToModal1 () {
    const viewModale1 = document.querySelector(".vuemodale1")
    viewModale1.style.display = null;
    const viewModale2 = document.querySelector(".vuemodale2");
    viewModale2.style.display = "none";
    const backArrow = document.querySelector(".retourvue1");
    backArrow.style.display = "none"; 
}
const backToProjectList = document.querySelector(".retourvue1");
backToProjectList.addEventListener("click", backToModal1);


// affichage des projets dans la modale 
function genererProjetModale(projets) {
    const sectionProjetModale = document.querySelector(".projets-disponibles");
    sectionProjetModale.innerHTML = ""; // vide la section avant de la remplir
    for (let i = 0; i < projets.length; i++) {
        const projetModale = projets[i];
        const projetContainer = document.createElement("div");
        projetContainer.classList.add("projet-container");
        const imageProjetModale = document.createElement("img");
        imageProjetModale.src = projetModale.imageUrl;
        const iconTrash = document.createElement("i");
        iconTrash.classList.add("fa-solid", "fa-trash-can");
        //appel fonction suppression de projet ds la modale et page d'accueil
        iconTrash.addEventListener("click", () => supprimerProjet(projetModale.id, projetContainer));
        //rattache aux éléments parents 
        projetContainer.appendChild(imageProjetModale);
        projetContainer.appendChild(iconTrash);
        sectionProjetModale.appendChild(projetContainer);
    };
}

// lancement de la fonction pr affichage projets
genererProjetModale(projets);

// suppression d'un projet (modale et gallery)
async function supprimerProjet(projetId, projetElement) {
    const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce projet ?");
    if (!confirmation) return;
    const token = localStorage.getItem("auth-token");
    const response = await fetch(`http://localhost:5678/api/works/${projetId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    if (response.ok) {
        // suppression ds la modale
        projetElement.remove(); 
        // suppression ds la gallery
        const projetElementPagePrincipale = document.querySelector(`figure[data-id="${projetId}"]`);
            if (projetElementPagePrincipale) {
                projetElementPagePrincipale.remove();
            };
        alert("Projet supprimé avec succès !");
    } else {
        const errorMessage = await response.text();
        console.error("Erreur lors de la suppression :", errorMessage);
        alert("Erreur lors de la suppression du projet.");
    }
}

// ajout nouveau projet via le form-add-photo
document.querySelector(".valider-projet").addEventListener("click", async (event) => {
    event.preventDefault();

    // récup des données formulaire
    const imageInput = document.querySelector("#image");
    const titleInput = document.querySelector("#title");
    const categorySelect = document.querySelector("#category");

    const imageFile = imageInput.files[0];
    const title = titleInput.value;
    const category = categorySelect.value;

    // vérif des champs bien remplis
    if (!imageFile || !title || !category) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    // Données à envoyer avec FormData
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);
    formData.append("category", category);

    const token = localStorage.getItem("auth-token"); 
    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData 
    });

    if (response.ok) {
        const nouveauProjet = await response.json();
        // Ajouter le nouveau projet à la liste des projets
        projets.push(nouveauProjet); 
        // Mettre à jour la galerie et la modale
        genererProjet(projets);
        genererProjetModale(projets); 
        // Afficher un message de succès
        alert("Projet ajouté avec succès !");
        document.getElementById("form-add-photo").reset();
    } else {
        alert("Erreur lors de l'ajout du projet. Veuillez vérifier les informations.");
    }
})