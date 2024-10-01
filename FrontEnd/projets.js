// ****** CONNEXION UTILISATEUR 
const token = sessionStorage.getItem("auth-token");
const boutonConnexion = document.querySelector("#login-logout");
const bannerEditionMode = document.querySelector(".bannerEditionMode");
const bannerModifier = document.querySelector(".bannerModifier");

function afficherBoutonConnexion() {
    if (token) {
        boutonConnexion.textContent = "logout" ;
        boutonConnexion.setAttribute("href", "#");
        bannerEditionMode.style.display = "flex";
        bannerModifier.style.display = "flex";
        const boutons = document.querySelectorAll(".filters button");
        boutons.forEach(bouton => bouton.remove()); 

        // Deconnexion utilisateur
        boutonConnexion.addEventListener("click", () => {
            sessionStorage.removeItem("auth-token");
            window.location.href = "index.html";
        });        
    } 
}

//appel fonction connexion au chargement
window.onload = afficherBoutonConnexion();


// ***** AFFICHAGE PROJETS SUR PAGE D'ACCUEIL
let reponseProjets;
let projets;
const projectGallery = document.querySelector(".gallery");
const galleryinCaseServerDown = document.querySelector(".gallery-server-down");

// affichage des projets si server down
try {
    reponseProjets = await fetch("http://localhost:5678/api/works");
    if (!reponseProjets.ok) throw new Error("Echec de récupération des projets");
    projets = await reponseProjets.json();
} catch (error) {
    galleryinCaseServerDown.style.display = "grid";
}

async function genererProjet(projets) {
    projectGallery.innerHTML = "";
    projets.forEach(fiche => {
        const projetElement = document.createElement("figure");
        projetElement.setAttribute("data-id", fiche.id);

        const imageElement = document.createElement("img");
        imageElement.src = fiche.imageUrl;
        const figCaptionElement = document.createElement("figcaption");
        figCaptionElement.innerText = fiche.title;

        projetElement.appendChild(imageElement);
        projetElement.appendChild(figCaptionElement);
        projectGallery.appendChild(projetElement);
    });
}

genererProjet(projets);


// ***** GESTION DES BOUTONS FILTRES 
let categories;
let reponseCategoriesOk;

try {
    const reponseCategories = await fetch("http://localhost:5678/api/categories");
    reponseCategoriesOk = reponseCategories.ok;
    categories = await reponseCategories.json();
} catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
}


function retirerSelectionBoutons() {
    document.querySelectorAll(".filters button").forEach(bouton => bouton.classList.remove("selected"));
}

async function genererBouton(categories) {
    const emplacementBoutons = document.querySelector(".filters");
    const boutonTous = document.createElement("button");

    if (!token && reponseCategoriesOk) {
        emplacementBoutons.style.height = "150px";
        // gestion btn TOUS 
        boutonTous.innerHTML = "Tous";
        boutonTous.classList.add("selected");
        emplacementBoutons.appendChild(boutonTous);
        boutonTous.addEventListener("click", () => {
            genererProjet(projets);
            retirerSelectionBoutons();
            boutonTous.classList.add("selected");
        });
        // gestion btns autres catégories
        categories.forEach(categorie => {
            const boutonElement = document.createElement("button");
            boutonElement.innerHTML = categorie.name;
            boutonElement.dataset.id = categorie.id;

            boutonElement.addEventListener("click", () => {
                const projetsFiltres = projets.filter(projet => projet.categoryId === categorie.id);
                projectGallery.innerHTML = "";
                genererProjet(projetsFiltres);
                retirerSelectionBoutons();
                boutonElement.classList.add("selected");
            });
            emplacementBoutons.appendChild(boutonElement);
        });
    }
}

genererBouton(categories);


// ***** GESTION MODALE -ouverture/fermeture/vues
let modale = null; 
const viewDeleteProject = document.querySelector(".modal-vue-suppression-projet")
const viewAddProject = document.querySelector(".modal-vue-ajout-projet");
const backArrow = document.querySelector(".retour-vue-suppression-projet");
const buttonOpenModalFormAddProject = document.querySelector(".ajout-projet");

function stopPropagation(event) {
    event.stopPropagation();
}

// fonction ouverture de la modale
function openModal(event) {
    event.preventDefault();
    const target = document.querySelector(event.target.getAttribute("href"));
    target.style.display = null;
    target.removeAttribute("aria-hidden");
    target.setAttribute("aria-modal", "true");
    modale = target;
    modale.style.display="flex";
    modale.addEventListener("click", closeModal);
    modale.querySelector(".modal-stop").addEventListener("click", stopPropagation);

    modale.querySelectorAll(".fermerModale").forEach(button => {
        button.addEventListener("click", closeModal);
    });
}

// fonction fermeture de la modale
function closeModal(event) {
    if (!modale) return;

    event.preventDefault();
    backToModalDeleteProject(); // retour à la vue initiale si on est sur la vue 2

    modale.style.display="none";
    modale.setAttribute("aria-hidden", "true");
    modale.removeAttribute("aria-modal");
    modale.removeEventListener("click", closeModal);
    modale.querySelector(".modal-stop").removeEventListener("click", stopPropagation);
    modale = null;
}

// fonction ouverture de la seconde vue 
function openModalFormAddProject () {
    viewDeleteProject.style.display = "none";
    viewAddProject.style.display = "inline";
    backArrow.style.display = "inline"; 
}

// fonction retour à la première vue 
function backToModalDeleteProject () {
    viewDeleteProject.style.display = null;
    viewAddProject.style.display = "none";
    backArrow.style.display = "none"; 
}

// appel des fonctions pour ouverture et naviguations entre les vues
document.querySelector(".boutonModifier").addEventListener("click", openModal);
backArrow.addEventListener("click", backToModalDeleteProject);
buttonOpenModalFormAddProject.addEventListener("click", openModalFormAddProject);


// ***** GESTION MODALE - contenu 

// view1 - affichage des projets dans la modale 
async function genererProjetModale(projets) {
    const sectionProjetModale = document.querySelector(".projets-disponibles");
    sectionProjetModale.innerHTML = "";

    projets.forEach(projetModale => {
        const projetContainer = document.createElement("div");
        projetContainer.classList.add("projet-container");

        const imageProjetModale = document.createElement("img");
        imageProjetModale.src = projetModale.imageUrl;

        const iconTrash = document.createElement("i");
        iconTrash.classList.add("fa-solid", "fa-trash-can");

        iconTrash.addEventListener("click", async () => {
            await supprimerProjet(projetModale.id, projetContainer);
        });

        projetContainer.appendChild(imageProjetModale);
        projetContainer.appendChild(iconTrash);
        sectionProjetModale.appendChild(projetContainer);
    });
}

genererProjetModale(projets);


// **** SUPPRESSION D'UN PROJET (modale et gallery)
async function supprimerProjet(projetId, projetElement) {
    const confirmation = confirm("Êtes-vous sûr de vouloir supprimer ce projet ?");
    if (!confirmation) return;

    try {
        const response = await fetch(`http://localhost:5678/api/works/${projetId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            projetElement.remove(); // suppression DOM
            projets = projets.filter(projet => projet.id !== projetId); // supression ds tableau local des projets 

            const projetElementPagePrincipale = document.querySelector(`figure[data-id="${projetId}"]`);
                if (projetElementPagePrincipale) {
                    projetElementPagePrincipale.remove();
                };
                
            alert("Projet supprimé avec succès !");
        } else {
            alert("Erreur lors de la suppression du projet.");
        }
    } catch {
        alert("Echec de la suppression du projet, vérifiez la connexion au serveur");
        console.error("Echec de la suppression du projet : ", error);
    }
}


// ***** FORMULAIRE - ajout d'un nouveau projet
const imageInput = document.getElementById("image");
const label = document.querySelector("label[for=image]");
const selectCategory = document.getElementById("category");
const form = document.getElementById("form-add-photo");
const buttonValider = document.querySelector(".valider-projet");
const titleInput = document.getElementById("title");

async function chargerCategories() {
    selectCategory.innerHTML = "";    
    categories.forEach(categorie => {
                const option = document.createElement("option");
                option.value = categorie.id;
                option.textContent = categorie.name;
                selectCategory.appendChild(option);
        });
}

function imageUpload() {
    imageInput.addEventListener("change", async (event) => {
        const file = imageInput.files[0]; 
        const maxSize = 4 * 1024 * 1024;
        const validFormats = ["image/jpeg", "image/png", "image/jpg"];
        
        if (file) {
            event.preventDefault();
            if (file.size > maxSize) {
                alert("L'image ne doit pas dépasser 4 Mo.");
                imageInput.value = ""; 
                return;
            }
            if (!validFormats.includes(file.type)) {
                alert("Format non valide. Veuillez sélectionner une image au format JPG, JPEG ou PNG.");
                imageInput.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                label.innerHTML = `<img src="${e.target.result}" alt="Image sélectionnée" />`;
            };
            reader.readAsDataURL(file);
        }
    });
}

function activateButtonValider() {
    form.addEventListener("input", () => {
        if (imageInput.files.length > 0 && titleInput.value && selectCategory.value) {
            buttonValider.style.backgroundColor = "#1D6154";
        } else {
            buttonValider.style.backgroundColor = "#a6a6a6";
        }
    });
}

function resetForm() {
    form.reset(); 
    label.innerHTML = `<i class="fa-regular fa-image"></i>
                       <span>+ Ajouter photo</span>
                       <p>jpg, png : 4mo max</p>`;
    buttonValider.style.backgroundColor = "#a6a6a6";
}

async function ajouterProjet(event) {
    event.preventDefault();

    // récup des données formulaire
    const imageInput = document.querySelector("#image");
    const titleInput = document.querySelector("#title");
    const categorySelect = document.querySelector("#category");
    const imageFile = imageInput.files[0];
    const title = titleInput.value;
    const category = categorySelect.value;

    // vérif des champs bien remplis
    if (!imageFile) {
        alert("Veuillez télécharger une image");
        return;
    }
    if (!title) {
        alert("Veuillez indiquer un titre");
        return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);
    formData.append("category", category);

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData 
        });

        if (response.ok) {
            const nouveauProjet = await response.json();
            projets.push(nouveauProjet); // Ajouter le nouveau projet à la liste des projets
            genererProjet(projets); 
            genererProjetModale(projets); 

            alert("Projet ajouté avec succès !");
            resetForm();

        } else {
            alert("Erreur lors de l'ajout du projet. Veuillez vérifier les informations.");
        }
    } catch (error) {
        alert("Echec de l'ajout du projet, vérifiez la connexion au serveur");
        console.error("Echec de l'ajout du projet : ", error);
    }
}

chargerCategories();
imageUpload();
activateButtonValider();
document.querySelector(".valider-projet").addEventListener("click", ajouterProjet);