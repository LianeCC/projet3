// Récupération des projets réalisés depuis l'API
const reponseProjets = await fetch('http://localhost:5678/api/works');
const projets = await reponseProjets.json();

// création des projets 
function genererProjet(projets) {
    const sectionFiches = document.querySelector(".gallery");
    sectionFiches.innerHTML = ''; // vide la section avant de la remplir

    for (let i = 0; i < projets.length; i++) {
        const fiche = projets[i]; 
        // création de la balise pour une fiche 
        const projetElement = document.createElement("figure");
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

// Affiche tous les projets au chargement
genererProjet(projets);


// enlever 'selected' de tous les boutons
function retirerSelectionBoutons() {
    const boutons = document.querySelectorAll(".boutons button");
    boutons.forEach(bouton => bouton.classList.remove("selected"));
}


// Récupération des catégories depuis l'API
const reponseCategories = await fetch('http://localhost:5678/api/categories');
const categories = await reponseCategories.json();

function genererBouton(categories) {
    const emplacementBoutons = document.querySelector(".boutons");

    // Création du bouton "Tous"
    const boutonTous = document.createElement("button");
    boutonTous.innerHTML = "Tous";
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

genererBouton(categories);