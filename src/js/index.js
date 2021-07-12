import Search from './models/Search';
import Recipe from './models/Recipes';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchViews';
import * as recipeView from './views/recipeViews';
import * as listView from './views/listViews';
import * as likesView from './views/likesViews';

/*
* - Search objcet
* - Current recipe object
* - Shopping list object
* - Liked recipse
*/

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    constrolSearch();
});

const state = {};

/*
*   SEARCH CONTROLLER
*/ 

const constrolSearch = async () => {

    // Get the query from the view
    const query = searchView.getInput();

    if (query) {
        // search object and add to state
        state.search = new Search(query);

        // prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // search for recipes
            await state.search.getResults();
    
            // Renders results to UI
            clearLoader();
            searchView.renderResults(state.search.recipes);
        } catch (error) {
            alert('Something went wrong to load results! :(')
            clearLoader();
        }
    }
}

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.recipes,goToPage);
    }

});

/*
*   RECIPE CONTROLLER
*/ 
const controlRecipe = async () => {
    const id = window.location.hash.replace('#','');
    
    if (id){
        // prepare UI for results
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        // highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try{    
            // get recipe data and calculate servings and time            
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServings();
            
            // Renders results to UI        
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
            
        } catch (error) {
            alert('Something get wrong in loading the recipe! :(')
            clearLoader();
        }
    }    

};

['hashchange','load'].forEach(el => window.addEventListener(el, controlRecipe));


/*
*   LIST CONTROLLER
*/ 
const controlList = () => {
    // create a new list if there is not yet
    if (!state.list) state.list = new List();

    // add each ingredients in the list and to the UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};


/*
*   LIKE CONTROLLER
*/ 
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // user has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)){
        // add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // toggle the like button
        likesView.toggleLikeBtn(true);

        // add like to the UI
        likesView.renderLike(newLike);

    // user HAS yet liked current recipe
    } else {
        // remove like from the state
        state.likes.deleteLike(currentID);

        // toggle the like button
        likesView.toggleLikeBtn(false);

        // remove like from the UI
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // restore likes 
    state.likes.readStorage();

    // toggle button like menu
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // render all recipes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// handle delete and udpate list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle the delete event
    if( e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from the state
        state.list.deleteItem(id);

        // delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value,10);
        state.list.updateCount(id,val);
    }
});

// handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        if(state.recipe.servings > 1) state.recipe.updateServings('dec');
        recipeView.updateServingsIngreditens(state.recipe);
        recipeView.updateServingsIngreditens(state.recipe);
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngreditens(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add ingridientets to the list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});