const inquirer = require("inquirer");
const fs = require("fs");

// Carga de datos
const dbPath = "./data.json";
// Cargamos el objeto de forma SINCRONA y lo parseamos, ya que recibimos un string
const dbFile = JSON.parse(fs.readFileSync(dbPath, "utf8"));
// Cargamos el objeto de forma ASINCRONA
// fs.readFile(dbPath, (err, data) => {
// });

// colección de respuestas del usuario
const userAnswers = {
    nombre: null,
    tipo: null,
    userItem: null,
    userIdentifyItem: null
};
// Intentos del usuario
const maxTries = 2;
let currentTry = 0;

// Validacion de campos string
const stringValidator = value => value.length > 0 || "Debes introducir un valor"

// coleccón de preguntas al usuario
const questions = {
    step1: {
        type: "input",
        name: "name",
        message: "¿Cual es tu nombre?",
        validate: stringValidator
    },
    step2: {
        type: "list",
        name: "type",
        message: "¿En que tipo de elemento estas pensando?",
        choices: ["Animal", "Vegetal", "Mineral"]
    },
    stepUserItem: {
        type: "input",
        name: "userItem",
        message: "¿En qué estabas pensando?",
        validate: stringValidator
    },
    stepUserAnswer: {
        type: "input",
        name: "userIdentifyItem",
        message: "Escribe una pregunta que lo identifique",
        validate: stringValidator
    }
}

function saveData() {
    // Modelo datos segun estructura de mi DB
    const newItem = {
        name: userAnswers.userItem,
        author: userAnswers.nombre,
        questions: [
            userAnswers.userIdentifyItem
        ]
    };

    // Añado el nuevo item
    dbFile[userAnswers.tipo].push(newItem);

    // Guardo en DB
    const fileToString = JSON.stringify(dbFile);
    fs.writeFile(dbPath, fileToString, err => {
        if (err) {
            throw new Error("Algo ha ido mal al escribir");
        }
        // Despedida
        console.log(`Gracias ${userAnswers.nombre}, ahora ya conozco:
        
        ${dbFile.animal.length} animales.
        ${dbFile.vegetal.length} vegetales.
        ${dbFile.mineral.length} minerales.

        Vuelve a jugar cuando quieras :)
        `)
    })
}

async function endGame() {
    const answerEnd = await inquirer.prompt([
        questions.stepUserItem,
        questions.stepUserAnswer
    ]);

    userAnswers.userItem = answerEnd.userItem;
    userAnswers.userIdentifyItem = answerEnd.userIdentifyItem;

    saveData();
}

function winGame() {
    console.log(`
    Genial! He acertado!
    Muchas Gracias
    Vuelve a jugar cuando quieras :)
    `);
}

async function resolveGame(subject) {
    const stepResolve = await inquirer.prompt([
        {
            type: "confirm",
            name: "isResolved",
            message: `Estás pensando en ${subject}?`
        }
    ]);
    // Si acertamos, hemos ganado
    if (stepResolve.isResolved) {
        return winGame();
    };

    currentTry ++;
    tryAnswers();
}

async function tryAnswers() {

    if (currentTry >= maxTries) {
        console.log(`
        OK, me rindo :(
        No acierto a adivinar lo que tu mente es capaz de imaginar
        `)
        return endGame();
    }

    const selectedType = dbFile[userAnswers.tipo];
    // Numero aleatorio de entre los posible
    const posRandom = Math.round(Math.random() * (selectedType.length - 1));
    // Elijo el item
    const choice = selectedType[posRandom];
    // Hacemos una pregunta
    const stepTry = await inquirer.prompt([
        {
            type: "confirm",
            name: "isTryOk",
            message: choice.questions[0]
        }
    ]);
    // Aumento el try
    currentTry ++;

    // Comprobar si hemos acertado
    if (stepTry.isTryOk) {
        return resolveGame(choice.name);
        return winGame();
    }   

    tryAnswers();
}

// console.log(JSON.parse(dbFile).animal);
async function playGame() {
    console.log("--------------------------------------------------");
    console.log("Bienvenido al juego Animal/Vegetal/Mineral de CICE");
    console.log("--------------------------------------------------");

    // Primera pregunta
    const step1 = await inquirer.prompt([
        questions.step1        
    ]);  
    // Seteamos el valor de nombre  
    userAnswers.nombre = step1.name;

    // Segunda pregunta
    const step2 = await inquirer.prompt([
        questions.step2
    ]);
    // Seteamos el valor de tipo
    userAnswers.tipo = step2.type.toString().toLowerCase();

    // console.log(step1);
    // console.log(step2);
    

    console.log(`
    Ummmmm... un ${userAnswers.tipo}, dejame que piense...
    `);

    setTimeout(() => {
        const dbType = dbFile[userAnswers.tipo];
        // console.log(dbType);
        
        // Comprobamos que tenga elementos de ese tipo en mi DB
        if (dbType.length === 0) {
            // Si no hay, me rindo
            console.log("OOOOH, Aún no conozco elementos de ese tipo");
            // GAME OVER
            return endGame();
        }
        tryAnswers()
    }, 1500);
    
};


// Ejecuto el juego
playGame();