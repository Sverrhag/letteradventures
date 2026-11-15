// Several ways of saying the same thing, so the voice does not repeat one sentence all round.
// Loaded after phrases.js, phrases-more.js and words.js.
//
// `g` entries replace the single question of a game with a list the game picks from.
// `per` entries add extra per-letter sentences: "find2" and "find3" are alternatives to "find".
(function (root) {
const V = {
sv: {
  g: {
    askBildord: ['Vilket ord passar till bilden?', 'Vad föreställer bilden?', 'Hitta ordet som hör till bilden!', 'Titta på bilden. Vilket ord är det?'],
    askLasord: ['Vilken bild passar till ordet?', 'Läs ordet. Vilken bild är det?', 'Hitta bilden som hör till ordet!', 'Vad står det? Tryck på rätt bild!'],
    askForsta: ['Vilken bokstav börjar ordet på?', 'Lyssna. Vad är första bokstaven?', 'Vilken bokstav hör du först?', 'Hur börjar ordet?'],
    askSaknad: ['Vilken bokstav saknas?', 'Vilken bokstav fattas i ordet?', 'Här saknas en bokstav. Vilken?', 'Fyll i bokstaven som fattas!'],
    askOrd: ['Kan du skriva det här ordet?', 'Nu skriver vi nästa ord.', 'Stava det här ordet!'],
    wroteMore: ['Det stavade du rätt!', 'Hela ordet blev rätt!', 'Så stavas det!'],
  },
  per: {
    find2: L => `Var är bokstaven ${L}?`, find3: L => `Kan du trycka på bokstaven ${L}?`,
    next2: L => `Sedan kommer ${L}.`, next3: L => `Och så ${L}.`,
    start2: L => `Första bokstaven är ${L}.`,
    pairU2: L => `Hitta den lilla bokstaven som hör ihop med stora ${L}!`, pairL2: L => `Hitta den stora bokstaven som hör ihop med lilla ${L}!`,
  },
},
en: {
  g: {
    askBildord: ['Which word fits the picture?', 'What does the picture show?', 'Find the word that goes with the picture!', 'Look at the picture. Which word is it?'],
    askLasord: ['Which picture fits the word?', 'Read the word. Which picture is it?', 'Find the picture that goes with the word!', 'What does it say? Tap the right picture!'],
    askForsta: ['Which letter does the word start with?', 'Listen. What is the first letter?', 'Which letter do you hear first?', 'How does the word begin?'],
    askSaknad: ['Which letter is missing?', 'Which letter is missing from the word?', 'A letter is missing here. Which one?', 'Fill in the missing letter!'],
    askOrd: ['Can you spell this word?', 'Let’s spell the next word.', 'Spell this word!'],
    wroteMore: ['You spelled it right!', 'The whole word is right!', 'That is how you spell it!'],
  },
  per: {
    find2: L => `Where is the letter ${L}?`, find3: L => `Can you press the letter ${L}?`,
    next2: L => `Next comes ${L}.`, next3: L => `And then ${L}.`,
    start2: L => `The first letter is ${L}.`,
    pairU2: L => `Find the small letter that goes with big ${L}!`, pairL2: L => `Find the big letter that goes with small ${L}!`,
  },
},
es: {
  g: {
    askBildord: ['¿Qué palabra corresponde a la imagen?', '¿Qué se ve en la imagen?', '¡Busca la palabra de la imagen!', 'Mira la imagen. ¿Qué palabra es?'],
    askLasord: ['¿Qué imagen corresponde a la palabra?', 'Lee la palabra. ¿Qué imagen es?', '¡Busca la imagen de la palabra!', '¿Qué pone? ¡Toca la imagen correcta!'],
    askForsta: ['¿Con qué letra empieza la palabra?', 'Escucha. ¿Cuál es la primera letra?', '¿Qué letra oyes primero?', '¿Cómo empieza la palabra?'],
    askSaknad: ['¿Qué letra falta?', '¿Qué letra falta en la palabra?', 'Aquí falta una letra. ¿Cuál es?', '¡Pon la letra que falta!'],
    askOrd: ['¿Puedes escribir esta palabra?', 'Vamos con la siguiente palabra.', '¡Escribe esta palabra!'],
    wroteMore: ['¡La has escrito bien!', '¡Toda la palabra está bien!', '¡Así se escribe!'],
  },
  per: {
    find2: L => `¿Dónde está la letra ${L}?`, find3: L => `¿Puedes pulsar la letra ${L}?`,
    next2: L => `Después viene la ${L}.`, next3: L => `Y luego la ${L}.`,
    start2: L => `La primera letra es la ${L}.`,
    pairU2: L => `¡Busca la letra minúscula que va con la ${L} mayúscula!`, pairL2: L => `¡Busca la letra mayúscula que va con la ${L} minúscula!`,
  },
},
fr: {
  g: {
    askBildord: ['Quel mot va avec l’image ?', 'Que montre l’image ?', 'Trouve le mot qui va avec l’image !', 'Regarde l’image. Quel mot est-ce ?'],
    askLasord: ['Quelle image va avec le mot ?', 'Lis le mot. Quelle image est-ce ?', 'Trouve l’image qui va avec le mot !', 'Qu’est-ce qui est écrit ? Touche la bonne image !'],
    askForsta: ['Par quelle lettre commence le mot ?', 'Écoute. Quelle est la première lettre ?', 'Quelle lettre entends-tu en premier ?', 'Comment commence le mot ?'],
    askSaknad: ['Quelle lettre manque ?', 'Quelle lettre manque dans le mot ?', 'Il manque une lettre ici. Laquelle ?', 'Ajoute la lettre qui manque !'],
    askOrd: ['Peux-tu écrire ce mot ?', 'On écrit le mot suivant.', 'Écris ce mot !'],
    wroteMore: ['Tu l’as bien écrit !', 'Tout le mot est juste !', 'C’est comme ça que ça s’écrit !'],
  },
  per: {
    find2: L => `Où est la lettre ${L} ?`, find3: L => `Peux-tu appuyer sur la lettre ${L} ?`,
    next2: L => `Ensuite vient la lettre ${L}.`, next3: L => `Et puis la lettre ${L}.`,
    start2: L => `La première lettre est ${L}.`,
    pairU2: L => `Trouve la petite lettre qui va avec le grand ${L} !`, pairL2: L => `Trouve la grande lettre qui va avec le petit ${L} !`,
  },
},
pt: {
  g: {
    askBildord: ['Qual palavra combina com a imagem?', 'O que a imagem mostra?', 'Encontre a palavra da imagem!', 'Olhe a imagem. Que palavra é?'],
    askLasord: ['Qual imagem combina com a palavra?', 'Leia a palavra. Que imagem é?', 'Encontre a imagem da palavra!', 'O que está escrito? Toque na imagem certa!'],
    askForsta: ['Com que letra a palavra começa?', 'Escute. Qual é a primeira letra?', 'Que letra você ouve primeiro?', 'Como a palavra começa?'],
    askSaknad: ['Que letra está faltando?', 'Que letra falta na palavra?', 'Falta uma letra aqui. Qual é?', 'Coloque a letra que falta!'],
    askOrd: ['Você consegue escrever esta palavra?', 'Vamos para a próxima palavra.', 'Escreva esta palavra!'],
    wroteMore: ['Você escreveu certinho!', 'A palavra inteira está certa!', 'É assim que se escreve!'],
  },
  per: {
    find2: L => `Onde está a letra ${L}?`, find3: L => `Você consegue apertar a letra ${L}?`,
    next2: L => `Depois vem a letra ${L}.`, next3: L => `E depois a letra ${L}.`,
    start2: L => `A primeira letra é ${L}.`,
    pairU2: L => `Encontre a letra minúscula que combina com o ${L} maiúsculo!`, pairL2: L => `Encontre a letra maiúscula que combina com o ${L} minúsculo!`,
  },
},
de: {
  g: {
    askBildord: ['Welches Wort passt zum Bild?', 'Was zeigt das Bild?', 'Finde das Wort zum Bild!', 'Schau dir das Bild an. Welches Wort ist das?'],
    askLasord: ['Welches Bild passt zum Wort?', 'Lies das Wort. Welches Bild ist das?', 'Finde das Bild zum Wort!', 'Was steht da? Tippe auf das richtige Bild!'],
    askForsta: ['Mit welchem Buchstaben fängt das Wort an?', 'Hör zu. Was ist der erste Buchstabe?', 'Welchen Buchstaben hörst du zuerst?', 'Wie fängt das Wort an?'],
    askSaknad: ['Welcher Buchstabe fehlt?', 'Welcher Buchstabe fehlt im Wort?', 'Hier fehlt ein Buchstabe. Welcher?', 'Setz den fehlenden Buchstaben ein!'],
    askOrd: ['Kannst du dieses Wort schreiben?', 'Jetzt kommt das nächste Wort.', 'Schreib dieses Wort!'],
    wroteMore: ['Das hast du richtig geschrieben!', 'Das ganze Wort stimmt!', 'So schreibt man das!'],
  },
  per: {
    find2: L => `Wo ist der Buchstabe ${L}?`, find3: L => `Kannst du auf den Buchstaben ${L} drücken?`,
    next2: L => `Danach kommt das ${L}.`, next3: L => `Und dann das ${L}.`,
    start2: L => `Der erste Buchstabe ist das ${L}.`,
    pairU2: L => `Finde den kleinen Buchstaben zum großen ${L}!`, pairL2: L => `Finde den großen Buchstaben zum kleinen ${L}!`,
  },
}};

function apply(LANGS) {
  for (const lang of Object.keys(LANGS)) {
    if (!V[lang]) continue;
    Object.assign(LANGS[lang].g, V[lang].g);
    Object.assign(LANGS[lang].per, V[lang].per);
  }
  return LANGS;
}

const api = { apply };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else apply(root.LA.LANGS);
})(typeof window !== 'undefined' ? window : globalThis);
