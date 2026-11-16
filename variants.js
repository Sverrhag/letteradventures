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

// Opening lines for each game, the "big letter / small letter" questions used when both
// cases are practised, and the label of the button that reloads the game.
const MORE = {
sv: {
  ui: { setReload: '🔄 Hämta senaste versionen', playersLabel: 'Vem spelar?', newPlayer: 'Ny spelare', setRemoveLabel: 'Ta bort en spelare', setRemoveType: n => `Skriv ${n} för att ta bort spelaren och allt som är sparat`, setRemoveGo: 'Ta bort för alltid',
        lookLabel: 'Välj utseende', looks: ['Äventyr', 'Regnbåge', 'Rymden', 'Djungel', 'Havet'], tagline: 'Lär dig bokstäver och ord med dina djurvänner' },
  g: {
    hi: 'Hej,', greetRest: 'Välkommen till Letter Adventures! Vad vill du spela?',
    introAlfabet: ['Nu skriver vi hela alfabetet!', 'Dags för alfabetet, från början till slut!', 'Alfabetet väntar. Nu kör vi!'],
    introHitta: ['Nu letar vi bokstäver på tangentbordet!', 'Dags att leta bokstäver!', 'Kan du hitta bokstäverna? Nu kör vi!'],
    introLyssna: ['Lyssna noga!', 'Spetsa öronen!', 'Nu gäller det att lyssna!'],
    introPara: ['Nu parar vi ihop stora och små bokstäver!', 'Vilka bokstäver hör ihop? Nu tar vi reda på det!', 'Dags att para ihop stora och små!'],
    introOrd: ['Nu skriver vi ord!', 'Dags att stava!', 'Nu ska vi skriva några ord!'],
    introBildord: ['Nu parar vi ihop bilder och ord!', 'Bilder och ord, nu kör vi!', 'Dags att hitta rätt ord till bilderna!'],
    introLasord: ['Nu ska vi läsa ord!', 'Dags att läsa!', 'Nu läser vi några ord!'],
    introForsta: ['Nu lyssnar vi efter första bokstaven!', 'Vilken bokstav kommer först? Lyssna noga!', 'Dags att lyssna efter första bokstaven!'],
    introSaknad: ['Nu letar vi efter bokstäver som saknas!', 'Några bokstäver har försvunnit. Kan du hitta dem?', 'Dags att fylla i bokstäver som fattas!'],
  },
  per: {
    findU2: L => `Var är stora ${L}?`, findU3: L => `Kan du trycka på stora ${L}?`,
    findL2: L => `Var är lilla ${L}?`, findL3: L => `Kan du trycka på lilla ${L}?`,
  },
},
en: {
  ui: { setReload: '🔄 Get the latest version', playersLabel: 'Who is playing?', newPlayer: 'New player', setRemoveLabel: 'Remove a player', setRemoveType: n => `Type ${n} to remove the player and everything saved`, setRemoveGo: 'Remove for good',
        lookLabel: 'Choose a look', looks: ['Adventure', 'Rainbow', 'Space', 'Jungle', 'Ocean'], tagline: 'Learn letters and words with your animal friends' },
  g: {
    hi: 'Hi,', greetRest: 'Welcome to Letter Adventures! What would you like to play?',
    introAlfabet: ['Let’s type the whole alphabet!', 'Time for the alphabet, from start to finish!', 'The alphabet is waiting. Here we go!'],
    introHitta: ['Let’s find letters on the keyboard!', 'Time to look for letters!', 'Can you find the letters? Here we go!'],
    introLyssna: ['Listen carefully!', 'Ears ready!', 'Now it is time to listen!'],
    introPara: ['Let’s match big and small letters!', 'Which letters belong together? Let’s find out!', 'Time to match big and small!'],
    introOrd: ['Let’s spell some words!', 'Time to spell!', 'Now we are going to write some words!'],
    introBildord: ['Let’s match pictures and words!', 'Pictures and words, here we go!', 'Time to find the right word for each picture!'],
    introLasord: ['Let’s read some words!', 'Time to read!', 'Now we read a few words!'],
    introForsta: ['Let’s listen for the first letter!', 'Which letter comes first? Listen carefully!', 'Time to listen for the first letter!'],
    introSaknad: ['Let’s look for missing letters!', 'Some letters have gone missing. Can you find them?', 'Time to fill in the missing letters!'],
  },
  per: {
    findU2: L => `Where is big ${L}?`, findU3: L => `Can you press big ${L}?`,
    findL2: L => `Where is small ${L}?`, findL3: L => `Can you press small ${L}?`,
  },
},
es: {
  ui: { setReload: '🔄 Cargar la última versión', playersLabel: '¿Quién juega?', newPlayer: 'Nuevo jugador', setRemoveLabel: 'Quitar un jugador', setRemoveType: n => `Escribe ${n} para quitar al jugador y todo lo guardado`, setRemoveGo: 'Quitar para siempre',
        lookLabel: 'Elige un estilo', looks: ['Aventura', 'Arcoíris', 'Espacio', 'Selva', 'Océano'], tagline: 'Aprende letras y palabras con tus amigos animales' },
  g: {
    hi: 'Hola,', greetRest: '¡Te doy la bienvenida a Letter Adventures! ¿A qué quieres jugar?',
    introAlfabet: ['¡Vamos a escribir todo el abecedario!', '¡Toca el abecedario, de principio a fin!', 'El abecedario nos espera. ¡Vamos!'],
    introHitta: ['¡Vamos a buscar letras en el teclado!', '¡Hora de buscar letras!', '¿Encuentras las letras? ¡Vamos!'],
    introLyssna: ['¡Escucha con atención!', '¡Abre bien los oídos!', '¡Ahora toca escuchar!'],
    introPara: ['¡Vamos a unir letras mayúsculas y minúsculas!', '¿Qué letras van juntas? ¡Vamos a verlo!', '¡Hora de unir mayúsculas y minúsculas!'],
    introOrd: ['¡Vamos a escribir palabras!', '¡Hora de deletrear!', '¡Ahora escribimos unas palabras!'],
    introBildord: ['¡Vamos a unir imágenes y palabras!', 'Imágenes y palabras, ¡vamos!', '¡Hora de encontrar la palabra de cada imagen!'],
    introLasord: ['¡Vamos a leer palabras!', '¡Hora de leer!', '¡Ahora leemos unas palabras!'],
    introForsta: ['¡Vamos a escuchar la primera letra!', '¿Qué letra va primero? ¡Escucha bien!', '¡Hora de escuchar la primera letra!'],
    introSaknad: ['¡Vamos a buscar las letras que faltan!', 'Se han perdido unas letras. ¿Las encuentras?', '¡Hora de poner las letras que faltan!'],
  },
  per: {
    findU2: L => `¿Dónde está la ${L} mayúscula?`, findU3: L => `¿Puedes pulsar la ${L} mayúscula?`,
    findL2: L => `¿Dónde está la ${L} minúscula?`, findL3: L => `¿Puedes pulsar la ${L} minúscula?`,
  },
},
fr: {
  ui: { setReload: '🔄 Charger la dernière version', playersLabel: 'Qui joue ?', newPlayer: 'Nouveau joueur', setRemoveLabel: 'Supprimer un joueur', setRemoveType: n => `Écrivez ${n} pour supprimer le joueur et tout ce qui est enregistré`, setRemoveGo: 'Supprimer définitivement',
        lookLabel: 'Choisis un décor', looks: ['Aventure', 'Arc-en-ciel', 'Espace', 'Jungle', 'Océan'], tagline: 'Apprends les lettres et les mots avec tes amis les animaux' },
  g: {
    hi: 'Bonjour,', greetRest: 'Bienvenue dans Letter Adventures ! À quoi veux-tu jouer ?',
    introAlfabet: ['On écrit tout l’alphabet !', 'C’est l’heure de l’alphabet, du début à la fin !', 'L’alphabet nous attend. C’est parti !'],
    introHitta: ['On cherche des lettres sur le clavier !', 'C’est l’heure de chercher des lettres !', 'Tu trouves les lettres ? C’est parti !'],
    introLyssna: ['Écoute bien !', 'Ouvre grand tes oreilles !', 'Maintenant, on écoute !'],
    introPara: ['On associe les majuscules et les minuscules !', 'Quelles lettres vont ensemble ? On va voir !', 'C’est l’heure d’associer grandes et petites lettres !'],
    introOrd: ['On écrit des mots !', 'C’est l’heure d’épeler !', 'Maintenant, on écrit quelques mots !'],
    introBildord: ['On associe les images et les mots !', 'Des images et des mots, c’est parti !', 'C’est l’heure de trouver le bon mot pour chaque image !'],
    introLasord: ['On va lire des mots !', 'C’est l’heure de lire !', 'Maintenant, on lit quelques mots !'],
    introForsta: ['On écoute la première lettre !', 'Quelle lettre vient en premier ? Écoute bien !', 'C’est l’heure d’écouter la première lettre !'],
    introSaknad: ['On cherche les lettres qui manquent !', 'Des lettres ont disparu. Tu les retrouves ?', 'C’est l’heure d’ajouter les lettres qui manquent !'],
  },
  per: {
    findU2: L => `Où est le grand ${L} ?`, findU3: L => `Peux-tu appuyer sur le grand ${L} ?`,
    findL2: L => `Où est le petit ${L} ?`, findL3: L => `Peux-tu appuyer sur le petit ${L} ?`,
  },
},
pt: {
  ui: { setReload: '🔄 Carregar a versão mais recente', playersLabel: 'Quem vai jogar?', newPlayer: 'Novo jogador', setRemoveLabel: 'Remover um jogador', setRemoveType: n => `Digite ${n} para remover o jogador e tudo o que foi salvo`, setRemoveGo: 'Remover para sempre',
        lookLabel: 'Escolha um visual', looks: ['Aventura', 'Arco-íris', 'Espaço', 'Selva', 'Oceano'], tagline: 'Aprenda letras e palavras com seus amigos animais' },
  g: {
    hi: 'Oi,', greetRest: 'Boas-vindas ao Letter Adventures! Do que você quer brincar?',
    introAlfabet: ['Vamos escrever o alfabeto inteiro!', 'Hora do alfabeto, do começo ao fim!', 'O alfabeto está esperando. Vamos lá!'],
    introHitta: ['Vamos procurar letras no teclado!', 'Hora de procurar letras!', 'Você encontra as letras? Vamos lá!'],
    introLyssna: ['Escute com atenção!', 'Ouvidos atentos!', 'Agora é hora de escutar!'],
    introPara: ['Vamos combinar letras maiúsculas e minúsculas!', 'Quais letras combinam? Vamos descobrir!', 'Hora de combinar maiúsculas e minúsculas!'],
    introOrd: ['Vamos escrever palavras!', 'Hora de soletrar!', 'Agora vamos escrever algumas palavras!'],
    introBildord: ['Vamos combinar imagens e palavras!', 'Imagens e palavras, vamos lá!', 'Hora de achar a palavra certa de cada imagem!'],
    introLasord: ['Vamos ler palavras!', 'Hora de ler!', 'Agora vamos ler algumas palavras!'],
    introForsta: ['Vamos escutar a primeira letra!', 'Que letra vem primeiro? Escute bem!', 'Hora de escutar a primeira letra!'],
    introSaknad: ['Vamos procurar as letras que faltam!', 'Algumas letras sumiram. Você encontra?', 'Hora de colocar as letras que faltam!'],
  },
  per: {
    findU2: L => `Onde está o ${L} maiúsculo?`, findU3: L => `Você consegue apertar o ${L} maiúsculo?`,
    findL2: L => `Onde está o ${L} minúsculo?`, findL3: L => `Você consegue apertar o ${L} minúsculo?`,
  },
},
de: {
  ui: { setReload: '🔄 Neueste Version laden', playersLabel: 'Wer spielt?', newPlayer: 'Neuer Spieler', setRemoveLabel: 'Einen Spieler entfernen', setRemoveType: n => `${n} eintippen, um den Spieler und alles Gespeicherte zu entfernen`, setRemoveGo: 'Endgültig entfernen',
        lookLabel: 'Wähle ein Aussehen', looks: ['Abenteuer', 'Regenbogen', 'Weltraum', 'Dschungel', 'Ozean'], tagline: 'Lerne Buchstaben und Wörter mit deinen Tierfreunden' },
  g: {
    hi: 'Hallo,', greetRest: 'Willkommen bei Letter Adventures! Was möchtest du spielen?',
    introAlfabet: ['Jetzt schreiben wir das ganze Alphabet!', 'Zeit für das Alphabet, von Anfang bis Ende!', 'Das Alphabet wartet. Los geht’s!'],
    introHitta: ['Jetzt suchen wir Buchstaben auf der Tastatur!', 'Zeit, Buchstaben zu suchen!', 'Findest du die Buchstaben? Los geht’s!'],
    introLyssna: ['Hör gut zu!', 'Ohren auf!', 'Jetzt wird gut zugehört!'],
    introPara: ['Jetzt ordnen wir große und kleine Buchstaben zu!', 'Welche Buchstaben gehören zusammen? Finden wir es heraus!', 'Zeit, große und kleine Buchstaben zuzuordnen!'],
    introOrd: ['Jetzt schreiben wir Wörter!', 'Zeit zum Buchstabieren!', 'Jetzt schreiben wir ein paar Wörter!'],
    introBildord: ['Jetzt ordnen wir Bilder und Wörter zu!', 'Bilder und Wörter, los geht’s!', 'Zeit, zu jedem Bild das richtige Wort zu finden!'],
    introLasord: ['Jetzt lesen wir Wörter!', 'Zeit zum Lesen!', 'Jetzt lesen wir ein paar Wörter!'],
    introForsta: ['Jetzt hören wir auf den ersten Buchstaben!', 'Welcher Buchstabe kommt zuerst? Hör gut zu!', 'Zeit, auf den ersten Buchstaben zu hören!'],
    introSaknad: ['Jetzt suchen wir fehlende Buchstaben!', 'Ein paar Buchstaben sind verschwunden. Findest du sie?', 'Zeit, die fehlenden Buchstaben einzusetzen!'],
  },
  per: {
    findU2: L => `Wo ist das große ${L}?`, findU3: L => `Kannst du auf das große ${L} drücken?`,
    findL2: L => `Wo ist das kleine ${L}?`, findL3: L => `Kannst du auf das kleine ${L} drücken?`,
  },
}};

// The five voices appear as other figures in each look: in Space the first voice is the astronaut,
// in the Ocean the dolphin. The recorded voice is the same; only the picture, the name and the
// greeting ("Hi! I am the robot.") differ. Per look, in voice order: [article, name]. The Rainbow
// look keeps the figures in `voices` and `hello` of the language. The French l' has a straight
// apostrophe: with a curly one the voice says "le écureuil".
const CAST = {
  sv: { open: ['Hej!', 'Hej hej!', 'Hej!', 'Hej!', 'Hej!'], say: (o, a, n) => `${o} Jag är ${n.toLowerCase()}. Ska vi leka med bokstäver?`,
    adventure: [['', 'Ekorren'], ['', 'Kaninen'], ['', 'Ugglan'], ['', 'Björnen'], ['', 'Räven']],
    space: [['', 'Astronauten'], ['', 'Stjärnan'], ['', 'Månen'], ['', 'Roboten'], ['', 'Rymdvarelsen']],
    jungle: [['', 'Papegojan'], ['', 'Apan'], ['', 'Tigern'], ['', 'Dinosaurien'], ['', 'Grodan']],
    ocean: [['', 'Delfinen'], ['', 'Fisken'], ['', 'Sköldpaddan'], ['', 'Valen'], ['', 'Bläckfisken']] },
  en: { open: ['Hi!', 'Hello hello!', 'Hello!', 'Hello!', 'Hi!'], say: (o, a, n) => `${o} I am the ${n.toLowerCase()}. Shall we play with letters?`,
    adventure: [['', 'Squirrel'], ['', 'Rabbit'], ['', 'Owl'], ['', 'Bear'], ['', 'Fox']],
    space: [['', 'Astronaut'], ['', 'Star'], ['', 'Moon'], ['', 'Robot'], ['', 'Alien']],
    jungle: [['', 'Parrot'], ['', 'Monkey'], ['', 'Tiger'], ['', 'Dinosaur'], ['', 'Frog']],
    ocean: [['', 'Dolphin'], ['', 'Fish'], ['', 'Turtle'], ['', 'Whale'], ['', 'Octopus']] },
  es: { open: ['¡Hola!', '¡Hola, hola!', '¡Hola!', '¡Hola!', '¡Hola!'], say: (o, a, n) => `${o} Soy ${a} ${n.toLowerCase()}. ¿Jugamos con las letras?`,
    adventure: [['la', 'Ardilla'], ['el', 'Conejo'], ['el', 'Búho'], ['el', 'Oso'], ['el', 'Zorro']],
    space: [['la', 'Astronauta'], ['la', 'Estrella'], ['la', 'Luna'], ['el', 'Robot'], ['el', 'Extraterrestre']],
    jungle: [['el', 'Loro'], ['el', 'Mono'], ['el', 'Tigre'], ['el', 'Dinosaurio'], ['la', 'Rana']],
    ocean: [['el', 'Delfín'], ['el', 'Pez'], ['la', 'Tortuga'], ['la', 'Ballena'], ['el', 'Pulpo']] },
  fr: { open: ['Bonjour !', 'Coucou !', 'Bonjour !', 'Bonjour !', 'Salut !'], say: (o, a, n) => `${o} Je suis ${a}${a.endsWith("'") ? '' : ' '}${n.toLowerCase()}. On joue avec les lettres ?`,
    adventure: [["l'", 'Écureuil'], ['le', 'Lapin'], ['le', 'Hibou'], ["l'", 'Ours'], ['le', 'Renard']],
    space: [["l'", 'Astronaute'], ["l'", 'Étoile'], ['la', 'Lune'], ['le', 'Robot'], ["l'", 'Extraterrestre']],
    jungle: [['le', 'Perroquet'], ['le', 'Singe'], ['le', 'Tigre'], ['le', 'Dinosaure'], ['la', 'Grenouille']],
    ocean: [['le', 'Dauphin'], ['le', 'Poisson'], ['la', 'Tortue'], ['la', 'Baleine'], ['la', 'Pieuvre']] },
  pt: { open: ['Oi!', 'Oi, oi!', 'Olá!', 'Olá!', 'Oi!'], say: (o, a, n) => `${o} Eu sou ${a} ${n.toLowerCase()}. Vamos brincar com as letras?`,
    adventure: [['o', 'Esquilo'], ['o', 'Coelho'], ['a', 'Coruja'], ['o', 'Urso'], ['a', 'Raposa']],
    space: [['a', 'Astronauta'], ['a', 'Estrela'], ['a', 'Lua'], ['o', 'Robô'], ['o', 'Extraterrestre']],
    jungle: [['o', 'Papagaio'], ['o', 'Macaco'], ['o', 'Tigre'], ['o', 'Dinossauro'], ['o', 'Sapo']],
    ocean: [['o', 'Golfinho'], ['o', 'Peixe'], ['a', 'Tartaruga'], ['a', 'Baleia'], ['o', 'Polvo']] },
  de: { open: ['Hallo!', 'Hallo, hallo!', 'Hallo!', 'Hallo!', 'Hallo!'], say: (o, a, n) => `${o} Ich bin ${a} ${n}. Wollen wir mit Buchstaben spielen?`,
    adventure: [['das', 'Eichhörnchen'], ['der', 'Hase'], ['die', 'Eule'], ['der', 'Bär'], ['der', 'Fuchs']],
    space: [['die', 'Astronautin'], ['der', 'Stern'], ['der', 'Mond'], ['der', 'Roboter'], ['das', 'Alien']],
    jungle: [['der', 'Papagei'], ['der', 'Affe'], ['der', 'Tiger'], ['der', 'Dinosaurier'], ['der', 'Frosch']],
    ocean: [['der', 'Delfin'], ['der', 'Fisch'], ['die', 'Schildkröte'], ['der', 'Wal'], ['der', 'Tintenfisch']] },
};
const CAST_LOOKS = ['adventure', 'space', 'jungle', 'ocean'];

// Praise that names a figure ("The unicorn is dancing with joy!") follows the look: in the Jungle
// it is the monkey that dances and the parrot that is proud. `a` and `b` are the two figures in the
// phrases of the Rainbow look; each other look gives its own two, [name, is it masculine], and its
// own word for "Rainbow-tastic!". `masc` rewrites the adjectives that follow the figure's gender.
// In French the figure must not begin with L': at the start of a sentence the voice reads it as the letter L.
const THEMED = {
  sv: { a: 'Enhörningen', b: 'Nyckelpigan', masc: [],
    adventure: { a: 'Räven', b: ['Ekorren'], top: 'Vilket äventyr{, n}!' }, space: { a: 'Roboten', b: ['Astronauten'], top: 'Galaktiskt bra{, n}!' },
    jungle: { a: 'Apan', b: ['Papegojan'], top: 'Djungelbra{, n}!' }, ocean: { a: 'Bläckfisken', b: ['Delfinen'], top: 'Havsbra{, n}!' } },
  en: { a: 'The unicorn', b: 'The ladybug', masc: [],
    adventure: { a: 'The fox', b: ['The squirrel'], top: 'What an adventure{, n}!' }, space: { a: 'The robot', b: ['The astronaut'], top: 'Out of this world{, n}!' },
    jungle: { a: 'The monkey', b: ['The parrot'], top: 'Jungle-tastic{, n}!' }, ocean: { a: 'The octopus', b: ['The dolphin'], top: 'Ocean-tastic{, n}!' } },
  es: { a: 'El unicornio', b: 'La mariquita', masc: [['orgullosa', 'orgulloso'], ['orgullosísima', 'orgullosísimo']],
    adventure: { a: 'El zorro', b: ['La ardilla'], top: '¡Qué aventura{, n}!' }, space: { a: 'El robot', b: ['La astronauta'], top: '¡De otro planeta{, n}!' },
    jungle: { a: 'El mono', b: ['El loro', true], top: '¡Un rugido de aplausos{, n}!' }, ocean: { a: 'El pulpo', b: ['El delfín', true], top: '¡Una ola de aplausos{, n}!' } },
  fr: { a: 'La licorne', b: 'La coccinelle', masc: [['fière', 'fier']],
    adventure: { a: 'Le renard', b: ['Le lapin', true], top: 'Quelle aventure{, n} !' }, space: { a: 'Le robot', b: ["L'astronaute"], top: 'Un bravo étoilé{, n} !' },
    jungle: { a: 'Le singe', b: ['Le perroquet', true], top: 'Un bravo de la jungle{, n} !' }, ocean: { a: 'La pieuvre', b: ['Le dauphin', true], top: 'Une vague de bravos{, n} !' } },
  pt: { a: 'O unicórnio', b: 'A joaninha', masc: [['orgulhosa', 'orgulhoso']],
    adventure: { a: 'A raposa', b: ['O esquilo', true], top: 'Que aventura{, n}!' }, space: { a: 'O robô', b: ['A astronauta'], top: 'De outro planeta{, n}!' },
    jungle: { a: 'O macaco', b: ['O papagaio', true], top: 'Um rugido de parabéns{, n}!' }, ocean: { a: 'O polvo', b: ['O golfinho', true], top: 'Uma onda de parabéns{, n}!' } },
  de: { a: 'Das Einhorn', b: 'Der Marienkäfer', masc: [],
    adventure: { a: 'Der Fuchs', b: ['Das Eichhörnchen'], top: 'Was für ein Abenteuer{, n}!' }, space: { a: 'Der Roboter', b: ['Die Astronautin'], top: 'Galaktisch gut{, n}!' },
    jungle: { a: 'Der Affe', b: ['Der Papagei'], top: 'Dschungelstark{, n}!' }, ocean: { a: 'Der Tintenfisch', b: ['Der Delfin'], top: 'Meeresstark{, n}!' } },
};
const TOP = 'long_15'; // "Rainbow-tastic!"
// The phrases of one language that change with the look: {look: {clip id: phrase}}.
function themed(lang, g) {
  const T = THEMED[lang], out = {};
  for (const look of CAST_LOOKS) {
    const L = T[look], map = out[look] = {};
    const swap = (id, s) => {
      if (!s.includes(T.a) && !s.includes(T.b)) return;
      let t = s.split(T.a).join(L.a);
      if (t.includes(T.b)) { t = t.split(T.b).join(L.b[0]); if (L.b[1]) for (const [f, m] of T.masc) t = t.split(f).join(m); }
      map[id] = t;
    };
    for (const [key, val] of Object.entries(g)) {
      if (Array.isArray(val)) val.forEach((s, i) => swap(`${key}_${i}`, s)); else if (typeof val === 'string') swap(key, val);
    }
    map[TOP] = L.top;
  }
  return out;
}

// Only languages whose clips are recorded get the alternative wordings (see READY in words.js);
// `all` is set by the recording script.
function apply(LANGS, all) {
  const ready = all ? Object.keys(LANGS) : (root.LA && root.LA.READY) || [];
  for (const lang of Object.keys(LANGS)) {
    if (!V[lang]) continue;
    Object.assign(LANGS[lang].ui, MORE[lang].ui);
    const C = CAST[lang];
    LANGS[lang].cast = {}; LANGS[lang].helloCast = {};
    for (const look of CAST_LOOKS){
      LANGS[lang].cast[look] = C[look].map(([, n]) => n);
      LANGS[lang].helloCast[look] = C[look].map(([a, n], i) => C.say(C.open[i], a, n));
    }
    if (!ready.includes(lang)) continue;
    Object.assign(LANGS[lang].g, V[lang].g, MORE[lang].g);
    Object.assign(LANGS[lang].per, V[lang].per, MORE[lang].per);
    LANGS[lang].gLook = themed(lang, LANGS[lang].g);
  }
  return LANGS;
}

const api = { apply };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else apply(root.LA.LANGS);
})(typeof window !== 'undefined' ? window : globalThis);
