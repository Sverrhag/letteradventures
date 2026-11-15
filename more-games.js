// Texts and rhyme lists for three games: Catch the letter, Memory and Rhyme.
// Loaded after phrases.js, phrases-more.js, words.js and variants.js.
//
// `games` holds [name, subtitle] for the three games, in the order they are listed in game.js.
// `rhymes` holds groups of words that rhyme, each word followed by its picture. Words in
// different groups must NOT rhyme with each other, because the wrong answers are taken
// from other groups.
(function (root) {
const DATA = {
sv: {
  games: [['Fånga bokstaven', 'Tryck innan den landar'], ['Memory', 'Hitta två som hör ihop'], ['Rimma', 'Vilka ord låter lika?']],
  g: {
    introFanga: ['Nu fångar vi bokstäver som faller!', 'Bokstäverna regnar! Fånga dem!', 'Dags att fånga bokstäver!'],
    askFanga: 'Tryck på bokstaven innan den landar!', winFanga: 'Du fångade alla bokstäverna! Vilka snabba fingrar!',
    introMemory: ['Nu spelar vi memory!', 'Dags för memory!', 'Kan du hitta paren?'],
    askMemory: ['Vänd två kort som hör ihop!', 'Hitta två kort som passar ihop!'], winMemory: 'Du hittade alla paren! Vilket minne du har!',
    introRimma: ['Nu ska vi rimma!', 'Dags att rimma!', 'Vilka ord låter nästan likadant?'],
    askRimma: ['Vilket ord rimmar på', 'Vad rimmar på', 'Hitta ordet som rimmar på'], winRimma: 'Du hittade alla rimmen! Vilken rimmästare!',
  },
  rhymes: 'hus🏠,mus🐭;katt🐱,hatt🎩,natt🌃;bil🚗,pil🏹;sol☀️,stol🪑,fiol🎻;ko🐮,sko👞,bro🌉;tåg🚂,våg🌊,såg🪚;bok📖,krok🪝;orm🐍,storm⛈️;häst🐴,fest🎉;mun👄,brun🟤;glass🍦,tass🐾;nål🪡,skål🥣,mål🥅;gris🐷,is🧊,ris🍚;tand🦷,hand✋,sand🏖️;lök🧅,rök💨',
},
en: {
  games: [['Catch the letter', 'Press before it lands'], ['Memory', 'Find two that match'], ['Rhyme', 'Which words sound alike?']],
  g: {
    introFanga: ['Let’s catch falling letters!', 'It is raining letters! Catch them!', 'Time to catch letters!'],
    askFanga: 'Press the letter before it lands!', winFanga: 'You caught all the letters! What quick fingers!',
    introMemory: ['Let’s play memory!', 'Time for memory!', 'Can you find the pairs?'],
    askMemory: ['Turn over two cards that match!', 'Find two cards that go together!'], winMemory: 'You found all the pairs! What a memory you have!',
    introRimma: ['Let’s rhyme!', 'Time to rhyme!', 'Which words sound almost the same?'],
    askRimma: ['Which word rhymes with', 'What rhymes with', 'Find the word that rhymes with'], winRimma: 'You found all the rhymes! What a rhyme champion!',
  },
  rhymes: 'cat🐱,hat🎩,bat🦇;dog🐶,frog🐸,log🪵;bee🐝,tree🌳,key🔑;star⭐,car🚗;moon🌙,spoon🥄,balloon🎈;fox🦊,box📦;cake🎂,snake🐍;mouse🐭,house🏠;bear🐻,pear🍐,chair🪑;goat🐐,boat⛵,coat🧥;king🤴,ring💍;whale🐳,snail🐌;fish🐟,dish🍽️;duck🦆,truck🚚;bell🔔,shell🐚;rose🌹,nose👃;clock⏰,lock🔒,rock🪨;train🚂,rain🌧️,plane✈️;fly🪰,pie🥧,eye👁️,tie👔;hen🐔,pen🖊️,ten🔟',
},
es: {
  games: [['Atrapa la letra', 'Pulsa antes de que caiga'], ['Memoria', 'Encuentra las parejas'], ['Rimas', '¿Qué palabras suenan igual?']],
  g: {
    introFanga: ['¡Vamos a atrapar las letras que caen!', '¡Llueven letras! ¡Atrápalas!', '¡Hora de atrapar letras!'],
    askFanga: '¡Pulsa la letra antes de que caiga!', winFanga: '¡Has atrapado todas las letras! ¡Qué dedos tan rápidos!',
    introMemory: ['¡Vamos a jugar a la memoria!', '¡Hora de jugar a la memoria!', '¿Encuentras las parejas?'],
    askMemory: ['¡Dale la vuelta a dos cartas que vayan juntas!', '¡Busca dos cartas que hagan pareja!'], winMemory: '¡Has encontrado todas las parejas! ¡Qué buena memoria!',
    introRimma: ['¡Vamos a hacer rimas!', '¡Hora de rimar!', '¿Qué palabras suenan casi igual?'],
    askRimma: ['¿Qué palabra rima con', '¿Qué rima con', 'Busca la palabra que rima con'], winRimma: '¡Has encontrado todas las rimas! ¡Qué bien rimas!',
  },
  rhymes: 'gato🐱,pato🦆,zapato👞,plato🍽️;ratón🐭,león🦁,camión🚚,avión✈️,corazón❤️,melón🍈,jabón🧼;flor🌸,tambor🥁,tractor🚜;abeja🐝,oveja🐑,oreja👂;mano✋,gusano🪱,piano🎹;sol☀️,caracol🐌,girasol🌻;pera🍐,bandera🚩,escalera🪜,palmera🌴;silla🪑,ardilla🐿️,mantequilla🧈;queso🧀,hueso🦴,beso💋;ballena🐳,sirena🧜,cadena⛓️;conejo🐰,espejo🪞,cangrejo🦀;foca🦭,boca👄,roca🪨;vela🕯️,abuela👵,escuela🏫;dado🎲,helado🍦,candado🔒',
},
fr: {
  games: [['Attrape la lettre', 'Appuie avant qu’elle tombe'], ['Memory', 'Trouve les paires'], ['Les rimes', 'Quels mots se ressemblent ?']],
  g: {
    introFanga: ['On attrape les lettres qui tombent !', 'Il pleut des lettres ! Attrape-les !', 'C’est l’heure d’attraper des lettres !'],
    askFanga: 'Appuie sur la lettre avant qu’elle tombe !', winFanga: 'Tu as attrapé toutes les lettres ! Quels doigts rapides !',
    introMemory: ['On joue au memory !', 'C’est l’heure du memory !', 'Tu trouves les paires ?'],
    askMemory: ['Retourne deux cartes qui vont ensemble !', 'Trouve deux cartes qui forment une paire !'], winMemory: 'Tu as trouvé toutes les paires ! Quelle mémoire !',
    introRimma: ['On fait des rimes !', 'C’est l’heure des rimes !', 'Quels mots se ressemblent à la fin ?'],
    askRimma: ['Quel mot rime avec', 'Qu’est-ce qui rime avec', 'Trouve le mot qui rime avec'], winRimma: 'Tu as trouvé toutes les rimes ! Quel talent !',
  },
  rhymes: 'chat🐱,rat🐀,chocolat🍫;lapin🐰,sapin🌲,pain🍞,main✋,train🚂,requin🦈;bateau⛵,gâteau🎂,chapeau🎩,château🏰,vélo🚲,moto🏍️;souris🐭,fourmi🐜,riz🍚,lit🛏️,kiwi🥝;ballon🎈,lion🦁,avion✈️,camion🚚,poisson🐟,cochon🐷,citron🍋,mouton🐑;fleur🌸,tracteur🚜,ordinateur💻;pomme🍎,homme👨;chaussette🧦,fourchette🍴,baguette🥖,trompette🎺,casquette🧢;feu🔥,bleu🔵;roi🤴,doigt☝️,noix🌰;vache🐮,hache🪓;tortue🐢,statue🗽;nuage☁️,fromage🧀,plage🏖️',
},
pt: {
  games: [['Pegue a letra', 'Aperte antes de cair'], ['Memória', 'Encontre os pares'], ['Rimas', 'Quais palavras soam igual?']],
  g: {
    introFanga: ['Vamos pegar as letras que caem!', 'Está chovendo letras! Pegue todas!', 'Hora de pegar letras!'],
    askFanga: 'Aperte a letra antes que ela caia!', winFanga: 'Você pegou todas as letras! Que dedos rápidos!',
    introMemory: ['Vamos jogar memória!', 'Hora do jogo da memória!', 'Você encontra os pares?'],
    askMemory: ['Vire duas cartas que combinam!', 'Encontre duas cartas que formam um par!'], winMemory: 'Você encontrou todos os pares! Que memória!',
    introRimma: ['Vamos rimar!', 'Hora de rimar!', 'Quais palavras soam quase igual?'],
    askRimma: ['Que palavra rima com', 'O que rima com', 'Encontre a palavra que rima com'], winRimma: 'Você encontrou todas as rimas! Que craque das rimas!',
  },
  rhymes: 'gato🐱,rato🐭,pato🦆,sapato👞,prato🍽️;leão🦁,avião✈️,coração❤️,balão🎈,limão🍋,pão🍞,mão✋,caminhão🚚;bola⚽,escola🏫,sacola🛍️;abelha🐝,ovelha🐑,orelha👂;flor🌸,tambor🥁,trator🚜,computador💻;sol☀️,caracol🐌,girassol🌻;janela🪟,panela🍲,vela🕯️;foca🦭,boca👄,pipoca🍿;queijo🧀,beijo💋;cavalo🐴,galo🐓;banana🍌,cabana🛖;dente🦷,presente🎁,serpente🐍;lua🌙,rua🛣️;anel💍,pincel🖌️,mel🍯,papel📄',
},
de: {
  games: [['Fang den Buchstaben', 'Drück, bevor er landet'], ['Memory', 'Finde zwei, die zusammenpassen'], ['Reimen', 'Welche Wörter klingen gleich?']],
  g: {
    introFanga: ['Jetzt fangen wir fallende Buchstaben!', 'Es regnet Buchstaben! Fang sie!', 'Zeit, Buchstaben zu fangen!'],
    askFanga: 'Drück den Buchstaben, bevor er landet!', winFanga: 'Du hast alle Buchstaben gefangen! Was für schnelle Finger!',
    introMemory: ['Jetzt spielen wir Memory!', 'Zeit für Memory!', 'Findest du die Paare?'],
    askMemory: ['Dreh zwei Karten um, die zusammenpassen!', 'Finde zwei Karten, die ein Paar sind!'], winMemory: 'Du hast alle Paare gefunden! Was für ein Gedächtnis!',
    introRimma: ['Jetzt reimen wir!', 'Zeit zum Reimen!', 'Welche Wörter klingen fast gleich?'],
    askRimma: ['Welches Wort reimt sich auf', 'Was reimt sich auf', 'Finde das Wort, das sich reimt auf'], winRimma: 'Du hast alle Reime gefunden! Du bist ein Reim-Profi!',
  },
  rhymes: 'haus🏠,maus🐭;hund🐶,mund👄;katze🐱,tatze🐾;hose👖,rose🌹,dose🥫;schuh👞,kuh🐮;sonne☀️,tonne🗑️;hand✋,sand🏖️,band🎀;biene🐝,schiene🛤️;ziege🐐,fliege🪰;nase👃,hase🐰,vase🏺;tanne🌲,kanne🫖,pfanne🍳,wanne🛁;schwein🐷,bein🦵,stein🪨;brot🍞,boot⛵,rot🔴;eis🍦,reis🍚,kreis⭕;krone👑,zitrone🍋,melone🍈',
}};

function apply(LANGS) {
  for (const lang of Object.keys(LANGS)) {
    const D = DATA[lang], L = LANGS[lang];
    if (!D) continue;
    L.games = L.games.slice(0, 9).concat(D.games);
    Object.assign(L.g, D.g);
    // Rhyme words get a running number, used for their sound clips (rim_0, rim_1, ...).
    let ri = 0;
    L.rhymes = D.rhymes.split(';').map(grp => grp.split(',').map(item => {
      const [, w, e] = item.match(/^(\p{L}+)(.+)$/u);
      return { w: w.toLocaleUpperCase(lang), e, ri: ri++ };
    }));
    L.g.rim = L.rhymes.flat().map(o => o.w[0] + o.w.slice(1).toLocaleLowerCase(lang) + '.');
  }
  return LANGS;
}

const api = { apply };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else apply(root.LA.LANGS);
})(typeof window !== 'undefined' ? window : globalThis);
