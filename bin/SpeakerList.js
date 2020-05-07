this.list = [];


function SpeakerList(){
  this.list = [];
}

SpeakerList.prototype.addSpeaker = function(speaker){
    if(this.list.length === 0){
        this.list.push(speaker);
    }
    else{
        for(var index in this.list){
            if (this.list[index].id === speaker.id){
              return;
            }
            else if(this.list[index].speakCount > speaker.speakCount){
                this.list.splice(index, 0, speaker);
                return;
            }
        }
        this.list.push(speaker);
    }
};

SpeakerList.prototype.speakerSpoke = function(speaker){
    if(this.list.length){
        for(var index in this.list){
            if(this.list[index].id = speaker.id){
                this.list.splice(index, 1);
                speaker.speakCount++;
            }
        }
    }
};

SpeakerList.prototype.formatList = function(){
  var html = '<ul>';
  for (var index in this.list){
      html += '<li>' + this.list[index].name + ': ' + this.list[index].speakCount + '</li>';
  }
    html += '</ul>';
    return html;
};

SpeakerList.prototype.getList = function(){
  return this.list;
}

module.exports = SpeakerList;