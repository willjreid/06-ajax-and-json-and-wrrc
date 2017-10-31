'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENTED: Why isn't this method written as an arrow function?
// The function requires a contextual "this" to assign Constructor properties such as daysAgo.  Arrow functions only work with functions/methods that do not require a contextual "this."
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENTED: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // The following line utilizes the more streamlined notation for an if/then logic function.  IF this (the Article's) publishedStatus equals its publishedOn attribute, THEN return the text about having been published X days ago, OR ELSE return the text (draft).
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENTED: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// The rawData function will be called on the else part of the if statement in the fetchAll function if local storage does not have the data already. rawData in previous labs was used as a object method, and now rawData represets the returned data from hackerIpsum file.
Article.loadAll = rawData => {
  rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  rawData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.rawData) {
    // REVIEW: When rawData is already in localStorage we can load it with the .loadAll function above and then render the index page (using the proper method on the articleView object).

    //DONE: This function takes in an argument. What do we pass in to loadAll()?
    Article.loadAll(JSON.parse(localStorage.rawData));

    //DONE: What method do we call to render the index page?
    articleView.initIndexPage();
    // COMMENTED: How is this different from the way we rendered the index page previously? What the benefits of calling the method here?
    // If we call it on the index.html page, it will load without the benefit of getting data items from localStorage. If we call it here, we can trigger the loading of data items from localStorage as the page is "built."

  } else {
    // DONE: When we don't already have the rawData:
    // - we need to retrieve the JSON file from the server with AJAX (which jQuery method is best for this?)
    // - we need to cache it in localStorage so we can skip the server call next time
    // - we then need to load all the data into Article.all with the .loadAll function above
    // - then we can render the index page
    $.getJSON('data/hackerIpsum.json', function(rawData){
      localStorage.setItem(rawData, JSON.stringify(rawData));
      Article.loadAll(rawData);
      articleView.initIndexPage();
    });
    // COMMENTED: Discuss the sequence of execution in this 'else' conditional. Why are these functions executed in this order?
    // First we get the data content from the .json file, then trigger the successCallback function to hanlde rawData.  Once we have the data from the .josn file, then we can set the new Item rawData within localStorage and assign it the stringified data from rawData.  Then the Article constructor can load all the rawData contents.  Finally, when all the article content data is available, we can call the initIndexPage function to kick off all the (sub)functions that build the page and the dropdowns.  We could have used .done in the .getJSON function instead of the comma to indicate successCallback function.
    //
  }
}
