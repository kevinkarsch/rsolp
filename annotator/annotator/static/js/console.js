

function Console(element){
	this.element = element;
}

Console.prototype.log = function(msg){
	$(this.element).val($(this.element).val() + "[log] " + msg + "\n");
	$(this.element).scrollTop(this.element.scrollHeight);
}