let currentPage = 1;
let recipesPerPage = 20;
let filteredRecipes = [];
let allRecipes = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('./recipes.txt')
        .then(response => response.json())
        .then(data => {
            allRecipes = data;
            filteredRecipes = allRecipes;
            loadCategories(allRecipes);
            displayRecipes(currentPage, filteredRecipes);
        })
        .catch(error => console.error('Error loading recipes:', error));

    document.getElementById('search-text').addEventListener('input', applyFilters);
    document.getElementById('category-filter').addEventListener('change', applyFilters);
    document.getElementById('next-page').addEventListener('click', nextPage);
    document.getElementById('prev-page').addEventListener('click', prevPage);

    // Διαχείριση modal για τις συνταγές
    const recipeModal = document.getElementById('recipe-modal');
    const closeRecipeBtn = recipeModal.querySelector('.close');

    closeRecipeBtn.onclick = () => {
        recipeModal.style.display = 'none';  // Χρησιμοποιούμε το style.display για να κλείσουμε το modal
    };

    window.onclick = (event) => {
        if (event.target == recipeModal) {
            recipeModal.style.display = 'none';  // Κλείσιμο όταν γίνει κλικ εκτός του modal
        }
    };

    // Διαχείριση popup για προσωπικό πλάνο
    const planModal = document.getElementById('personal-plan-modal');
    const closeModalBtns = document.querySelectorAll('.close, .close-modal');

    document.getElementById('personalized-plan-btn').addEventListener('click', () => {
        planModal.classList.add('show');
        showStep(1);
    });

    closeModalBtns.forEach(btn => btn.addEventListener('click', () => {
        planModal.classList.remove('show');
    }));

    document.getElementById('next-step-1').addEventListener('click', () => {
        calculateBMI();
        showStep(2);
    });

    document.getElementById('next-step-2').addEventListener('click', () => {
        showStep(3);
    });

    document.getElementById('prev-step-2').addEventListener('click', () => {
        showStep(1);
    });

    document.getElementById('prev-step-3').addEventListener('click', () => {
        showStep(2);
    });

    document.getElementById('generate-plan').addEventListener('click', generatePlan);
});

function displayRecipes(page, recipes) {
    const recipesContainer = document.getElementById('recipes-container');
    recipesContainer.innerHTML = '';

    const startIndex = (page - 1) * recipesPerPage;
    const endIndex = startIndex + recipesPerPage;
    const paginatedRecipes = recipes.slice(startIndex, endIndex);

    paginatedRecipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.recipe}">
            <h2>${recipe.recipe}</h2>
            <p>Θερμίδες: ${recipe.calories}</p>
            <p>Υδατάνθρακες: ${recipe.carbohydrates_in_grams}g</p>
            <p class="category">${recipe.category.category}</p>
        `;

        // Προσθήκη event listener για άνοιγμα modal με λεπτομέρειες συνταγής
        recipeCard.addEventListener('click', () => openRecipeModal(recipe));  // Ανοιγμα του modal της συνταγής
        recipesContainer.appendChild(recipeCard);
    });

    updatePagination(page, recipes.length);
}

function openRecipeModal(recipe) {
    const modal = document.getElementById('recipe-modal');
    const modalContent = document.getElementById('modal-recipe-details');

    let ingredients = '';
    for (let i = 1; i <= 10; i++) {
        const ingredient = recipe[`ingredient_${i}`];
        const measurement = recipe[`measurement_${i}`];
        if (ingredient && measurement) {
            ingredients += `<p>${measurement} ${ingredient}</p>`;
        }
    }

    let directions = '';
    for (let i = 1; i <= 10; i++) {
        const direction = recipe[`directions_step_${i}`];
        if (direction) {
            directions += `<p>Βήμα ${i}: ${direction}</p>`;
        }
    }

    modalContent.innerHTML = `
        <h2>${recipe.recipe}</h2>
        <img src="${recipe.image}" alt="${recipe.recipe}">
        <h3>Υλικά</h3>
        ${ingredients}
        <h3>Οδηγίες</h3>
        ${directions}
    `;

    modal.style.display = 'block';  // Χρησιμοποιούμε το style.display για να εμφανιστεί το modal
}

// Συνάρτηση διαχείρισης pagination
function updatePagination(page, totalRecipes) {
    const totalPages = Math.ceil(totalRecipes / recipesPerPage);

    document.getElementById('current-page').textContent = page;
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = page === totalPages;
}

function nextPage() {
    currentPage++;
    displayRecipes(currentPage, filteredRecipes);
}

function prevPage() {
    currentPage--;
    displayRecipes(currentPage, filteredRecipes);
}

// Συνάρτηση για εφαρμογή φίλτρων στις συνταγές
function applyFilters() {
    const searchText = document.getElementById('search-text').value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;

    filteredRecipes = allRecipes.filter(recipe => {
        const matchesText = recipe.recipe.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === 'all' || recipe.category.category === selectedCategory;

        return matchesText && matchesCategory;
    });

    currentPage = 1;
    displayRecipes(currentPage, filteredRecipes);
}

// Συνάρτηση φόρτωσης κατηγοριών
function loadCategories(recipes) {
    const categoryFilter = document.getElementById('category-filter');
    const categories = [...new Set(recipes.map(recipe => recipe.category.category))];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Συνάρτηση διαχείρισης βημάτων του Wizard για το προσωπικό πρόγραμμα
function showStep(step) {
    const steps = document.querySelectorAll('.wizard-step');
    steps.forEach(s => s.style.display = 'none');
    document.getElementById(`step-${step}`).style.display = 'block';
}

function calculateBMI() {
    const weight = parseInt(document.getElementById('weight').value);
    const height = parseInt(document.getElementById('height').value) / 100;

    if (!weight || !height) {
        alert('Συμπληρώστε τα στοιχεία σωστά.');
        return;
    }

    const bmi = (weight / (height * height)).toFixed(2);
    document.getElementById('bmi-value').textContent = `Ο ΔΜΣ σας είναι: ${bmi}`;
}

function generatePlan() {
    const goal = document.getElementById('diet-goal').value;
    const exercise = document.getElementById('exercise-frequency').value;
    let planMessage = 'Το προτεινόμενο σας πρόγραμμα είναι:\n';

    if (goal === 'lose') {
        planMessage += 'Απώλεια βάρους με χαμηλές θερμίδες.';
    } else if (goal === 'maintain') {
        planMessage += 'Συντήρηση βάρους με ισορροπημένη διατροφή.';
    } else if (goal === 'gain') {
        planMessage += 'Αύξηση βάρους με υψηλές θερμίδες.';
    }

    if (exercise === 'low') {
        planMessage += ' Σας συνιστούμε να αυξήσετε τη φυσική σας δραστηριότητα.';
    } else if (exercise === 'moderate') {
        planMessage += ' Η μέτρια φυσική δραστηριότητα είναι επαρκής για τους στόχους σας.';
    } else if (exercise === 'high') {
        planMessage += ' Η υψηλή φυσική δραστηριότητα θα βοηθήσει στην επίτευξη των στόχων σας.';
    }

    document.getElementById('generated-plan').textContent = planMessage;

    showStep(4);
}
