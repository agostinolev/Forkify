import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => el.classList.remove('results__link--active'));

    document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
};

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);

        // return the result
        return `${newTitle.join(' ')} ...`;
    }
    return title;
}

const renderRecipe = (recipe) => {
    const markup = `
    <li>
        <a class="results__link results__link--active" href="#${recipe.recipe_id}">
            <figure class="results__fig">
               <img src=${recipe.image_url} alt=${limitRecipeTitle(recipe.title)}>
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
          </div>
        </a>
    </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

const createBtn = (page, type) => 
    `
       <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
           <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
           <svg class="search__icon">
                <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
            </svg>
        </button>
`;

const renderBtn = (numRecipes, page, elemPerPage) => {
    const pages = Math.ceil(numRecipes / elemPerPage);
    let button;
    if ( page === 1 && pages > 1){
        button = createBtn(page,'next');
    } else if (page < pages){
        button = `
            ${createBtn(page,'prev')}
            ${createBtn(page,'next')}
        `;
    } else if (page === pages && pages > 1) {
        button = createBtn(page,'prev');
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};


export const renderResults = (recipes, page = 1, elemPerPage = 10) => {
    const start = (page - 1) * elemPerPage;
    const end = page * elemPerPage;
    recipes.slice(start,end).forEach(renderRecipe);
    renderBtn(recipes.length, page,elemPerPage);
};