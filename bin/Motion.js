this.motionText = '';
this.author = {};
this.second = {};

this.amendment = '';


function Motion(motionText, author, second){
  this.motionText = motionText;
  this.author = author;
  this.second = second;
}

function ammend(amendmentText){
  this.amendment = amendmentText;
}

module.exports = Motion;