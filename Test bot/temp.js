const fs = require('fs')

let data = fs.readFileSync('temp.json')
data = JSON.parse(data)
for (let i = 0; i<data.common.length; i++) {
	data.common[i] = 
	{
		name: data.common[i],
		caseURL: "",
        afterURL: "",
        event: false
	}
}
for (let i = 0; i<data.rare.length; i++) {
	data.rare[i] = 
	{
		name: data.rare[i],
		caseURL: "",
        afterURL: "",
        event: false
	}
}
for (let i = 0; i<data.epic.length; i++) {
	data.epic[i] = 
	{
		name: data.epic[i],
		caseURL: "",
        afterURL: "",
        event: false
	}
}
for (let i = 0; i<data.legendary.length; i++) {
	data.legendary[i] = 
	{
		name: data.legendary[i],
		caseURL: "",
        afterURL: "",
        event: false
	}
}
for (let i = 0; i<data.mythical.length; i++) {
	data.mythical[i] = 
	{
		name: data.mythical[i],
		caseURL: "",
        afterURL: "",
        event: false
	}
}
data = JSON.stringify(data)
fs.writeFileSync('temp.json', data)