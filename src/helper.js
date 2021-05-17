module.exports = {

    sleep: function (ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    },

    getRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        
        return Math.floor(Math.random() * (max - min) + min);
    },

    range: range,
    getOneAndInsert: getOneAndInsert,
    print: print
}

function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
        foo.push(i);
    }
    return foo;
}

function getOneAndInsert(arr) {
    foo = arr[0]
    arr.shift()
    arr.push(foo)

    return arr
}

function getDate(){
	var date = new Date();
	return date.toISOString()
}


function print(threadID, color, message){
    const colors 		= require('colors');

	switch(color){
		case 'red':
			console.log(colors.gray(`${getDate()}`) + ` THREAD ${threadID}: ` + colors.red(message))

			break
		case 'green':
			console.log(colors.gray(`${getDate()}`) + ` THREAD ${threadID}: ` + colors.green(message))

			break
		case 'yellow':
			console.log(colors.gray(`${getDate()}`) + ` THREAD ${threadID}: ` + colors.yellow(message))

			break
}
}