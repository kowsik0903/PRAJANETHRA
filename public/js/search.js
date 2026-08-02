function searchNews(){

let input=document.getElementById("searchInput").value.toUpperCase();

let cards=document.querySelectorAll(".search-card");

let found=false;

cards.forEach(function(card){

let title=card.querySelector("h3").innerText.toUpperCase();

if(title.indexOf(input)>-1){

card.style.display="block";

found=true;

}

else{

card.style.display="none";

}

});

document.getElementById("noResult").style.display=

found?"none":"block";

}