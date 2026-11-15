// The word list for the word games: 400 words per language in 20 levels of 20.
// Loaded after phrases.js and phrases-more.js; it replaces their short `words` lists.
//
// Each line is one picture and its word in six languages:
//   picture | English | Spanish | French | Brazilian Portuguese | German | Swedish
// A dash means the language has no good single word for the picture, so it is skipped there.
// Words keep their accents. When typing, the plain letter is accepted for an accented one.
//
// For each language the first 400 usable words are sorted by length, shortest first, and
// cut into levels of 20: level 1 has the shortest words, level 20 the longest.
(function (root) {
const ORDER = ['en', 'es', 'fr', 'pt', 'de', 'sv'];
const TABLE = `
🐶|dog|perro|chien|cachorro|hund|hund
🐱|cat|gato|chat|gato|katze|katt
🐭|mouse|ratón|souris|rato|maus|mus
🐹|hamster|hámster|hamster|hamster|hamster|hamster
🐰|rabbit|conejo|lapin|coelho|hase|kanin
🦊|fox|zorro|renard|raposa|fuchs|räv
🐻|bear|oso|ours|urso|bär|björn
🐼|panda|panda|panda|panda|panda|panda
🐨|koala|koala|koala|coala|koala|koala
🐯|tiger|tigre|tigre|tigre|tiger|tiger
🦁|lion|león|lion|leão|löwe|lejon
🐮|cow|vaca|vache|vaca|kuh|ko
🐷|pig|cerdo|cochon|porco|schwein|gris
🐸|frog|rana|grenouille|sapo|frosch|groda
🐵|monkey|mono|singe|macaco|affe|apa
🐔|hen|gallina|poule|galinha|henne|höna
🐧|penguin|pingüino|pingouin|pinguim|pinguin|pingvin
🐦|bird|pájaro|oiseau|pássaro|vogel|fågel
🐤|chick|pollito|poussin|pintinho|küken|kyckling
🦆|duck|pato|canard|pato|ente|anka
🦅|eagle|águila|aigle|águia|adler|örn
🦉|owl|búho|hibou|coruja|eule|uggla
🦇|bat|murciélago|-|morcego|fledermaus|fladdermus
🐺|wolf|lobo|loup|lobo|wolf|varg
🐗|boar|jabalí|sanglier|javali|wildschwein|vildsvin
🐴|horse|caballo|cheval|cavalo|pferd|häst
🦄|unicorn|unicornio|licorne|unicórnio|einhorn|enhörning
🐝|bee|abeja|abeille|abelha|biene|bi
🐛|caterpillar|oruga|chenille|lagarta|raupe|larv
🦋|butterfly|mariposa|papillon|borboleta|schmetterling|fjäril
🐌|snail|caracol|escargot|caracol|schnecke|snigel
🐞|ladybug|mariquita|coccinelle|joaninha|marienkäfer|nyckelpiga
🐜|ant|hormiga|fourmi|formiga|ameise|myra
🕷️|spider|araña|araignée|aranha|spinne|spindel
🦂|scorpion|escorpión|scorpion|escorpião|skorpion|skorpion
🐢|turtle|tortuga|tortue|tartaruga|schildkröte|sköldpadda
🐍|snake|serpiente|serpent|cobra|schlange|orm
🦎|lizard|lagarto|lézard|lagarto|eidechse|ödla
🐙|octopus|pulpo|pieuvre|polvo|krake|bläckfisk
🦐|shrimp|gamba|crevette|camarão|garnele|räka
🦞|lobster|langosta|homard|lagosta|hummer|hummer
🦀|crab|cangrejo|crabe|caranguejo|krabbe|krabba
🐟|fish|pez|poisson|peixe|fisch|fisk
🐬|dolphin|delfín|dauphin|golfinho|delfin|delfin
🐳|whale|ballena|baleine|baleia|wal|val
🦈|shark|tiburón|requin|tubarão|hai|haj
🐊|crocodile|cocodrilo|crocodile|crocodilo|krokodil|krokodil
🐆|leopard|leopardo|léopard|leopardo|leopard|leopard
🦓|zebra|cebra|zèbre|zebra|zebra|zebra
🦍|gorilla|gorila|gorille|gorila|gorilla|gorilla
🐘|elephant|elefante|éléphant|elefante|elefant|elefant
🦛|hippo|hipopótamo|hippopotame|hipopótamo|nilpferd|flodhäst
🦏|rhino|rinoceronte|rhinocéros|rinoceronte|nashorn|noshörning
🐪|camel|camello|chameau|camelo|kamel|kamel
🦒|giraffe|jirafa|girafe|girafa|giraffe|giraff
🦘|kangaroo|canguro|kangourou|canguru|känguru|känguru
🐃|buffalo|búfalo|buffle|búfalo|büffel|buffel
🐂|ox|buey|taureau|boi|ochse|oxe
🐏|ram|carnero|bélier|carneiro|widder|bagge
🐑|sheep|oveja|mouton|ovelha|schaf|får
🐐|goat|cabra|chèvre|cabra|ziege|get
🦌|deer|ciervo|cerf|veado|hirsch|hjort
🐩|poodle|caniche|caniche|poodle|pudel|pudel
🐓|rooster|gallo|coq|galo|hahn|tupp
🦃|turkey|pavo|dinde|peru|truthahn|kalkon
🦚|peacock|-|paon|pavão|pfau|påfågel
🦜|parrot|loro|perroquet|papagaio|papagei|papegoja
🦢|swan|cisne|cygne|cisne|schwan|svan
🦩|flamingo|flamenco|-|flamingo|flamingo|flamingo
🕊️|dove|paloma|colombe|pomba|taube|duva
🦝|raccoon|mapache|-|guaxinim|waschbär|tvättbjörn
🦨|skunk|mofeta|moufette|gambá|stinktier|skunk
🦡|badger|tejón|blaireau|texugo|dachs|grävling
🦦|otter|nutria|loutre|lontra|otter|utter
🦥|sloth|perezoso|paresseux|preguiça|faultier|sengångare
🐀|rat|rata|rat|ratazana|ratte|råtta
🐿️|squirrel|ardilla|écureuil|esquilo|eichhörnchen|ekorre
🦔|hedgehog|erizo|hérisson|ouriço|igel|igelkott
🐲|dragon|dragón|dragon|dragão|drache|drake
🦕|dinosaur|dinosaurio|dinosaure|dinossauro|dinosaurier|dinosaurie
🐾|paw|-|patte|pata|pfote|tass
🦗|cricket|grillo|grillon|grilo|grille|syrsa
🦟|mosquito|mosquito|moustique|mosquito|mücke|mygga
🪰|fly|mosca|mouche|mosca|fliege|fluga
🪱|worm|gusano|ver|minhoca|wurm|mask
🐚|shell|concha|coquillage|concha|muschel|snäcka
🦭|seal|foca|phoque|foca|robbe|säl
🦫|beaver|castor|castor|castor|biber|bäver
🦣|mammoth|mamut|mammouth|mamute|mammut|mammut
🪲|beetle|escarabajo|scarabée|besouro|käfer|skalbagge
🦙|llama|llama|lama|lhama|lama|lama
🍎|apple|manzana|pomme|maçã|apfel|äpple
🍐|pear|pera|poire|pera|birne|päron
🍊|orange|naranja|orange|laranja|orange|apelsin
🍋|lemon|limón|citron|limão|zitrone|citron
🍌|banana|plátano|banane|banana|banane|banan
🍉|watermelon|sandía|pastèque|melancia|wassermelone|vattenmelon
🍇|grapes|uvas|raisin|uva|trauben|druvor
🍓|strawberry|fresa|fraise|morango|erdbeere|jordgubbe
🫐|blueberry|arándano|myrtille|mirtilo|blaubeere|blåbär
🍈|melon|melón|melon|melão|melone|melon
🍒|cherry|cereza|cerise|cereja|kirsche|körsbär
🍑|peach|melocotón|pêche|pêssego|pfirsich|persika
🥭|mango|mango|mangue|manga|mango|mango
🍍|pineapple|piña|ananas|abacaxi|ananas|ananas
🥥|coconut|coco|-|coco|kokosnuss|kokosnöt
🥝|kiwi|kiwi|kiwi|kiwi|kiwi|kiwi
🍅|tomato|tomate|tomate|tomate|tomate|tomat
🍆|eggplant|berenjena|aubergine|berinjela|aubergine|aubergine
🥑|avocado|aguacate|avocat|abacate|avocado|avokado
🥦|broccoli|brócoli|brocoli|brócolis|brokkoli|broccoli
🥬|lettuce|lechuga|laitue|alface|salat|sallad
🥒|cucumber|pepino|concombre|pepino|gurke|gurka
🌶️|chili|chile|piment|pimenta|chili|chili
🫑|pepper|pimiento|poivron|pimentão|paprika|paprika
🌽|corn|maíz|maïs|milho|mais|majs
🥕|carrot|zanahoria|carotte|cenoura|karotte|morot
🧄|garlic|ajo|ail|alho|knoblauch|vitlök
🧅|onion|cebolla|oignon|cebola|zwiebel|lök
🥔|potato|patata|-|batata|kartoffel|potatis
🥐|croissant|cruasán|croissant|croissant|croissant|croissant
🍞|bread|pan|pain|pão|brot|bröd
🥖|baguette|-|baguette|baguete|baguette|baguette
🥨|pretzel|-|bretzel|-|brezel|kringla
🧀|cheese|queso|fromage|queijo|käse|ost
🥚|egg|huevo|-|ovo|ei|ägg
🧈|butter|mantequilla|beurre|manteiga|butter|smör
🥞|pancakes|tortitas|crêpes|panquecas|pfannkuchen|pannkakor
🧇|waffle|gofre|gaufre|-|waffel|våffla
🥓|bacon|beicon|bacon|bacon|speck|bacon
🍖|meat|carne|viande|carne|fleisch|kött
🍔|hamburger|hamburguesa|hamburger|hambúrguer|hamburger|hamburgare
🍟|fries|-|frites|-|pommes|pommes
🍕|pizza|pizza|pizza|pizza|pizza|pizza
🥪|sandwich|bocadillo|sandwich|sanduíche|-|smörgås
🌮|taco|taco|taco|taco|taco|taco
🥗|salad|ensalada|salade|salada|-|-
🍝|spaghetti|espaguetis|spaghettis|espaguete|spaghetti|spagetti
🍜|noodles|fideos|nouilles|macarrão|nudeln|nudlar
🍲|stew|guiso|ragoût|ensopado|eintopf|gryta
🍣|sushi|sushi|sushi|sushi|sushi|sushi
🍚|rice|arroz|riz|arroz|reis|ris
🍦|-|helado|glace|sorvete|eis|glass
🍩|donut|rosquilla|beignet|rosquinha|donut|munk
🍪|cookie|galleta|biscuit|biscoito|keks|kaka
🎂|cake|tarta|gâteau|bolo|torte|tårta
🧁|cupcake|magdalena|-|-|muffin|muffins
🥧|pie|pastel|tarte|torta|kuchen|paj
🍫|chocolate|chocolate|chocolat|chocolate|schokolade|choklad
🍬|candy|caramelo|bonbon|bala|bonbon|godis
🍭|lollipop|piruleta|sucette|pirulito|lutscher|klubba
🍯|honey|miel|miel|mel|honig|honung
🥛|milk|leche|lait|leite|milch|mjölk
☕|coffee|café|café|café|kaffee|kaffe
🍵|tea|té|thé|chá|tee|te
🧃|juice|zumo|jus|suco|saft|juice
🧊|ice|hielo|-|gelo|-|is
🥄|spoon|cuchara|cuillère|colher|löffel|sked
🍴|fork|tenedor|fourchette|garfo|gabel|gaffel
🔪|knife|cuchillo|couteau|faca|messer|kniv
🍽️|plate|plato|assiette|prato|teller|tallrik
🥣|bowl|cuenco|bol|tigela|schüssel|skål
🧂|salt|sal|sel|sal|salz|salt
🥜|peanut|cacahuete|cacahuète|amendoim|erdnuss|jordnöt
🌰|chestnut|castaña|châtaigne|castanha|kastanie|kastanj
🍄|mushroom|seta|champignon|cogumelo|pilz|svamp
🍿|popcorn|palomitas|-|pipoca|popcorn|popcorn
🥫|can|lata|-|lata|dose|burk
🍼|bottle|biberón|biberon|mamadeira|-|nappflaska
🥩|steak|filete|steak|bife|steak|biff
🫘|beans|judías|haricots|feijão|bohnen|bönor
🍮|pudding|flan|flan|pudim|pudding|pudding
🫖|teapot|tetera|théière|bule|teekanne|tekanna
☀️|sun|sol|soleil|sol|sonne|sol
🌙|moon|luna|lune|lua|mond|måne
⭐|star|estrella|étoile|estrela|stern|stjärna
☁️|cloud|nube|nuage|nuvem|wolke|moln
🌧️|rain|lluvia|pluie|chuva|regen|regn
⛈️|storm|tormenta|orage|tempestade|gewitter|åska
❄️|snow|nieve|neige|neve|schnee|snö
⛄|snowman|-|-|-|schneemann|snögubbe
🌈|rainbow|arcoíris|-|-|regenbogen|regnbåge
🔥|fire|fuego|feu|fogo|feuer|eld
💧|drop|gota|goutte|gota|tropfen|droppe
🌊|wave|ola|vague|onda|welle|våg
🌪️|tornado|tornado|tornade|tornado|tornado|tornado
🌋|volcano|volcán|volcan|vulcão|vulkan|vulkan
⛰️|mountain|montaña|montagne|montanha|berg|berg
🏝️|island|isla|île|ilha|insel|ö
🏜️|desert|desierto|désert|deserto|wüste|öken
🌳|tree|árbol|arbre|árvore|baum|träd
🌲|fir|abeto|sapin|pinheiro|tanne|gran
🌴|palm|palmera|palmier|palmeira|palme|palm
🌵|cactus|cactus|cactus|cacto|kaktus|kaktus
🌷|tulip|tulipán|tulipe|tulipa|tulpe|tulpan
🌹|rose|rosa|rose|rosa|rose|ros
🌻|sunflower|girasol|tournesol|girassol|sonnenblume|solros
🌸|flower|flor|fleur|flor|blume|blomma
🍀|clover|trébol|trèfle|trevo|klee|klöver
🍂|leaf|hoja|feuille|folha|blatt|löv
🪨|rock|roca|rocher|pedra|felsen|sten
🪵|log|tronco|bûche|tronco|-|stock
🌍|world|mundo|monde|mundo|welt|jord
🪐|planet|planeta|planète|planeta|planet|planet
☄️|comet|cometa|comète|cometa|komet|komet
⚡|lightning|rayo|éclair|raio|blitz|blixt
🌫️|fog|niebla|brouillard|neblina|nebel|dimma
🌬️|wind|viento|vent|vento|wind|vind
🌼|daisy|margarita|marguerite|margarida|-|-
🍃|leaves|hojas|feuilles|folhas|blätter|blad
🌾|wheat|trigo|blé|trigo|weizen|vete
🪸|coral|coral|corail|coral|koralle|korall
🏠|house|casa|maison|casa|haus|hus
🚪|door|puerta|porte|porta|tür|dörr
🪟|window|ventana|fenêtre|janela|fenster|fönster
🛏️|bed|cama|lit|cama|bett|säng
🛋️|sofa|sofá|canapé|sofá|sofa|soffa
🪑|chair|silla|chaise|cadeira|stuhl|stol
🚽|toilet|inodoro|toilettes|privada|toilette|toalett
🚿|shower|ducha|douche|chuveiro|dusche|dusch
🛁|bathtub|bañera|baignoire|banheira|badewanne|badkar
🧼|soap|jabón|savon|sabonete|seife|tvål
🧽|sponge|esponja|éponge|esponja|schwamm|-
🧹|broom|escoba|balai|vassoura|besen|kvast
🧺|basket|cesta|panier|cesto|korb|korg
🪣|bucket|cubo|seau|balde|eimer|hink
🔑|key|llave|clé|chave|schlüssel|nyckel
🔒|lock|candado|cadenas|cadeado|schloss|lås
🔨|hammer|martillo|marteau|martelo|hammer|hammare
🪚|saw|sierra|scie|serrote|säge|såg
🪛|screwdriver|destornillador|tournevis|-|schraubenzieher|skruvmejsel
🔩|screw|tornillo|vis|parafuso|schraube|skruv
🧲|magnet|imán|aimant|ímã|magnet|magnet
🪜|ladder|escalera|échelle|escada|leiter|stege
💡|lightbulb|bombilla|ampoule|lâmpada|glühbirne|glödlampa
🔦|flashlight|linterna|-|lanterna|taschenlampe|ficklampa
🕯️|candle|vela|bougie|vela|kerze|ljus
📱|phone|teléfono|téléphone|telefone|telefon|telefon
💻|computer|ordenador|ordinateur|computador|computer|dator
⌨️|keyboard|teclado|clavier|teclado|tastatur|tangentbord
🖨️|printer|impresora|imprimante|impressora|drucker|skrivare
📷|camera|cámara|-|câmera|kamera|kamera
📺|television|televisión|télévision|televisão|fernseher|teve
📻|radio|radio|radio|rádio|radio|radio
⏰|alarm|despertador|réveil|despertador|wecker|väckarklocka
⌚|watch|reloj|montre|relógio|uhr|klocka
🧭|compass|brújula|boussole|bússola|kompass|kompass
🔋|battery|pila|pile|pilha|batterie|batteri
📖|book|libro|livre|livro|buch|bok
✏️|pencil|lápiz|crayon|lápis|bleistift|penna
🖊️|pen|bolígrafo|stylo|caneta|kugelschreiber|-
🖍️|crayon|cera|-|-|wachsmalstift|krita
📏|ruler|regla|règle|régua|lineal|linjal
✂️|scissors|tijeras|ciseaux|tesoura|schere|sax
📎|paperclip|clip|trombone|clipe|büroklammer|gem
🖌️|brush|pincel|pinceau|pincel|pinsel|pensel
🎨|palette|paleta|palette|paleta|palette|palett
📦|box|caja|boîte|caixa|kiste|låda
✉️|letter|carta|lettre|carta|brief|brev
🎁|gift|regalo|cadeau|presente|geschenk|present
🎈|balloon|globo|ballon|balão|ballon|ballong
🧸|teddy|peluche|-|ursinho|teddybär|nalle
🪁|kite|-|-|pipa|drachen|-
🧩|puzzle|puzle|puzzle|-|puzzle|pussel
🎲|dice|dado|dé|dado|würfel|tärning
🪀|yoyo|yoyó|yoyo|ioiô|jojo|jojo
🔔|bell|campana|cloche|sino|glocke|-
🎀|ribbon|lazo|ruban|laço|schleife|rosett
👑|crown|corona|couronne|coroa|krone|krona
💎|diamond|diamante|diamant|diamante|diamant|diamant
💍|ring|anillo|bague|anel|ring|ring
👓|glasses|gafas|lunettes|óculos|brille|glasögon
🌂|umbrella|paraguas|parapluie|-|regenschirm|paraply
🎒|backpack|mochila|-|mochila|rucksack|ryggsäck
👜|bag|bolso|sac|bolsa|tasche|väska
🧳|suitcase|maleta|valise|mala|koffer|resväska
🪞|mirror|espejo|miroir|espelho|spiegel|spegel
🪥|toothbrush|-|-|-|zahnbürste|tandborste
🛒|cart|carrito|chariot|carrinho|-|kundvagn
🪴|plant|planta|plante|planta|pflanze|växt
🖼️|picture|cuadro|tableau|quadro|bild|tavla
🗑️|bin|papelera|poubelle|lixeira|mülleimer|soptunna
🪙|coin|moneda|pièce|moeda|münze|mynt
💰|money|dinero|argent|dinheiro|geld|pengar
🧵|thread|hilo|fil|linha|faden|tråd
🧶|yarn|lana|laine|lã|wolle|garn
🪡|needle|aguja|aiguille|agulha|nadel|nål
🔭|telescope|telescopio|télescope|telescópio|teleskop|teleskop
🔬|microscope|microscopio|microscope|microscópio|mikroskop|mikroskop
🗺️|map|mapa|carte|mapa|karte|karta
📅|calendar|calendario|calendrier|calendário|kalender|kalender
🏆|trophy|trofeo|trophée|troféu|pokal|pokal
🥇|medal|medalla|médaille|medalha|medaille|medalj
🎫|ticket|billete|billet|bilhete|ticket|biljett
🪄|wand|varita|-|varinha|zauberstab|trollstav
⚓|anchor|ancla|ancre|âncora|anker|ankare
🪝|hook|gancho|crochet|gancho|haken|krok
🧱|brick|ladrillo|brique|tijolo|ziegel|tegel
⛓️|chain|cadena|chaîne|corrente|kette|kedja
🪶|feather|pluma|plume|pena|feder|fjäder
🕸️|web|telaraña|toile|teia|netz|nät
🪹|nest|nido|nid|ninho|nest|bo
🧮|abacus|ábaco|boulier|ábaco|abakus|kulram
📚|books|libros|livres|livros|bücher|böcker
📰|newspaper|periódico|journal|jornal|zeitung|tidning
🔍|magnifier|lupa|loupe|lupa|lupe|lupp
🪓|axe|hacha|hache|machado|axt|yxa
🛡️|shield|escudo|bouclier|escudo|schild|sköld
🏺|vase|jarrón|vase|vaso|vase|vas
👕|shirt|camiseta|maillot|camiseta|hemd|tröja
👖|jeans|vaqueros|jean|jeans|jeans|jeans
👗|dress|vestido|robe|vestido|kleid|klänning
🧥|coat|abrigo|manteau|casaco|mantel|kappa
🧣|scarf|bufanda|écharpe|cachecol|schal|halsduk
🧤|gloves|guantes|gants|luvas|handschuhe|vantar
🧢|cap|gorra|casquette|boné|kappe|keps
🎩|hat|sombrero|chapeau|chapéu|hut|hatt
👟|sneaker|zapatilla|basket|tênis|turnschuh|gympasko
👞|shoe|zapato|chaussure|sapato|schuh|sko
👢|boot|bota|botte|bota|stiefel|stövel
👔|tie|corbata|cravate|gravata|krawatte|slips
🩳|shorts|-|short|shorts|shorts|shorts
⛑️|helmet|casco|casque|capacete|helm|hjälm
🧦|socks|calcetines|chaussettes|meias|socken|strumpor
👘|kimono|kimono|kimono|quimono|kimono|kimono
🚗|car|coche|voiture|carro|auto|bil
🚕|taxi|taxi|taxi|táxi|taxi|taxi
🚌|bus|autobús|bus|ônibus|bus|buss
🚑|ambulance|ambulancia|ambulance|ambulância|krankenwagen|ambulans
🚒|-|-|-|-|feuerwehr|brandbil
🚚|truck|camión|camion|caminhão|lastwagen|lastbil
🚜|tractor|tractor|tracteur|trator|traktor|traktor
🏍️|motorcycle|moto|moto|moto|motorrad|motorcykel
🛵|moped|-|scooter|-|roller|moped
🚲|bicycle|bicicleta|vélo|bicicleta|fahrrad|cykel
🛴|-|patinete|trottinette|patinete|-|sparkcykel
🛹|skateboard|monopatín|-|-|skateboard|skateboard
🚂|train|tren|train|trem|zug|tåg
🚇|subway|metro|métro|metrô|-|tunnelbana
🚊|tram|tranvía|tramway|bonde|-|spårvagn
✈️|airplane|avión|avion|avião|flugzeug|flygplan
🚁|helicopter|helicóptero|hélicoptère|helicóptero|hubschrauber|helikopter
🚀|rocket|cohete|fusée|foguete|rakete|raket
🛸|ufo|ovni|ovni|óvni|ufo|ufo
⛵|sailboat|velero|voilier|veleiro|segelboot|segelbåt
🚢|ship|barco|navire|navio|schiff|skepp
🛶|canoe|canoa|canoë|canoa|kanu|kanot
🚦|-|semáforo|-|semáforo|ampel|trafikljus
🛞|wheel|rueda|roue|roda|rad|hjul
⚙️|gear|engranaje|engrenage|engrenagem|zahnrad|kugghjul
👁️|eye|ojo|-|olho|auge|öga
👂|ear|oreja|oreille|orelha|ohr|öra
👃|nose|nariz|nez|nariz|nase|näsa
👄|mouth|boca|bouche|boca|mund|mun
👅|tongue|lengua|langue|língua|zunge|tunga
🦷|tooth|diente|dent|dente|zahn|tand
✋|hand|mano|main|mão|hand|hand
🦶|foot|pie|pied|pé|-|fot
🦵|leg|pierna|jambe|perna|bein|ben
💪|arm|brazo|bras|braço|arm|arm
🧠|brain|cerebro|cerveau|cérebro|gehirn|hjärna
🦴|bone|hueso|os|osso|knochen|-
❤️|heart|corazón|-|coração|herz|hjärta
👍|thumb|pulgar|pouce|polegar|daumen|tumme
☝️|finger|dedo|doigt|dedo|finger|finger
🏫|school|escuela|école|escola|schule|skola
🏥|hospital|hospital|hôpital|hospital|krankenhaus|sjukhus
🏰|castle|castillo|château|castelo|burg|slott
⛪|church|iglesia|église|igreja|kirche|kyrka
🏭|factory|fábrica|usine|fábrica|fabrik|fabrik
🏨|hotel|hotel|hôtel|hotel|hotel|hotell
🏦|bank|banco|banque|banco|bank|bank
🏪|shop|tienda|magasin|loja|laden|butik
⛺|tent|carpa|tente|barraca|zelt|tält
🌉|bridge|puente|pont|ponte|brücke|bro
🗼|tower|torre|tour|torre|turm|torn
⛲|fountain|fuente|fontaine|fonte|brunnen|fontän
🏟️|stadium|estadio|stade|estádio|stadion|stadion
🎪|circus|circo|cirque|circo|zirkus|cirkus
🏖️|beach|playa|plage|praia|strand|strand
🏡|garden|jardín|jardin|jardim|garten|trädgård
🛣️|road|carretera|route|estrada|-|väg
🏙️|city|ciudad|ville|cidade|stadt|stad
🗽|statue|estatua|statue|estátua|statue|staty
🏛️|museum|museo|musée|museu|museum|museum
🌃|night|noche|nuit|noite|nacht|natt
🛖|hut|choza|hutte|cabana|hütte|hydda
⚽|ball|pelota|balle|bola|ball|boll
🏀|basketball|baloncesto|-|basquete|basketball|basket
⚾|baseball|béisbol|baseball|beisebol|baseball|baseboll
🎾|tennis|tenis|tennis|-|tennis|tennis
🏐|volleyball|voleibol|volley|vôlei|volleyball|volleyboll
🏸|badminton|bádminton|badminton|badminton|badminton|badminton
🥅|goal|portería|but|gol|tor|mål
⛳|golf|golf|golf|golfe|golf|golf
🥊|boxing|boxeo|boxe|boxe|boxen|boxning
🛷|sled|trineo|luge|trenó|schlitten|pulka
⛸️|skate|patín|patin|patim|schlittschuh|skridsko
🎿|ski|esquí|ski|esqui|ski|skidor
🏹|bow|arco|arc|arco|bogen|båge
🎯|target|diana|cible|alvo|ziel|måltavla
🎸|guitar|guitarra|guitare|violão|gitarre|gitarr
🎹|piano|piano|piano|piano|klavier|piano
🎺|trumpet|trompeta|trompette|trompete|trompete|trumpet
🎻|violin|violín|violon|violino|geige|fiol
🥁|drum|tambor|tambour|tambor|trommel|trumma
🎷|saxophone|saxofón|saxophone|saxofone|saxophon|saxofon
🪗|accordion|acordeón|accordéon|acordeão|akkordeon|dragspel
🎤|microphone|micrófono|micro|microfone|mikrofon|mikrofon
🎧|headphones|auriculares|-|fones|kopfhörer|hörlurar
🎵|music|música|musique|música|musik|musik
🎬|film|película|film|filme|film|film
🎭|theater|teatro|théâtre|teatro|theater|teater
🎠|carousel|carrusel|manège|carrossel|karussell|karusell
🪂|parachute|paracaídas|parachute|paraquedas|fallschirm|fallskärm
🏊|swimming|natación|natation|natação|schwimmen|simning
♟️|chess|ajedrez|échecs|xadrez|schach|schack
🎳|bowling|bolos|bowling|boliche|bowling|bowling
🥋|judo|judo|judo|judô|judo|judo
🤿|snorkel|-|tuba|-|schnorchel|snorkel
🏄|surf|surf|surf|surfe|-|surfing
🛝|slide|tobogán|toboggan|escorregador|rutsche|rutschkana
👶|baby|bebé|bébé|bebê|baby|bebis
👧|girl|niña|fille|menina|mädchen|flicka
👦|boy|niño|garçon|menino|junge|pojke
👩|woman|mujer|femme|mulher|frau|kvinna
👨|man|hombre|homme|homem|mann|man
👵|grandma|abuela|mamie|vovó|oma|mormor
👴|grandpa|abuelo|papi|-|opa|morfar
👸|princess|princesa|princesse|princesa|prinzessin|prinsessa
🤴|prince|príncipe|prince|príncipe|prinz|prins
👮|police|policía|police|polícia|polizei|polis
👨‍🚒|firefighter|bombero|pompier|bombeiro|feuerwehrmann|brandman
👨‍⚕️|doctor|médico|docteur|médico|arzt|läkare
👩‍🏫|teacher|maestra|-|professora|lehrerin|lärare
👨‍🍳|cook|cocinero|cuisinier|cozinheiro|koch|kock
👨‍🌾|farmer|granjero|fermier|fazendeiro|bauer|bonde
👨‍🚀|astronaut|astronauta|astronaute|astronauta|astronaut|astronaut
👨‍✈️|pilot|piloto|pilote|piloto|pilot|pilot
🕵️|detective|detective|détective|detetive|detektiv|detektiv
🧙|wizard|mago|magicien|mago|zauberer|trollkarl
🧚|fairy|hada|fée|fada|fee|fe
🧜|mermaid|sirena|sirène|sereia|meerjungfrau|sjöjungfru
👻|ghost|fantasma|fantôme|fantasma|gespenst|spöke
🤖|robot|robot|robot|robô|roboter|robot
🤡|clown|payaso|clown|palhaço|clown|clown
👼|angel|ángel|ange|anjo|engel|ängel
🦸|hero|héroe|héros|herói|held|hjälte
🥷|ninja|ninja|ninja|ninja|ninja|ninja
🤠|cowboy|vaquero|-|-|cowboy|cowboy
👪|family|familia|famille|família|familie|familj
👫|friends|amigos|amis|amigos|freunde|vänner
🔴|red|rojo|rouge|vermelho|rot|röd
🔵|blue|azul|bleu|azul|blau|blå
🟢|green|verde|vert|verde|grün|grön
🟡|yellow|amarillo|jaune|amarelo|gelb|gul
🟣|purple|morado|violet|roxo|lila|lila
🟤|brown|marrón|marron|marrom|braun|brun
⚫|black|negro|noir|preto|schwarz|svart
⚪|white|blanco|blanc|branco|-|vit
🔺|triangle|triángulo|triangle|triângulo|dreieck|triangel
🟦|square|cuadrado|carré|quadrado|quadrat|kvadrat
⭕|circle|círculo|cercle|círculo|kreis|cirkel
❓|question|pregunta|question|pergunta|frage|fråga
💤|sleep|sueño|sommeil|sono|schlaf|sömn
🎉|party|fiesta|fête|festa|party|fest
🎃|pumpkin|calabaza|citrouille|abóbora|kürbis|pumpa
🎆|fireworks|-|-|-|feuerwerk|fyrverkeri
🚩|flag|bandera|drapeau|bandeira|flagge|flagga
💬|word|palabra|mot|palavra|wort|ord
🔊|sound|sonido|son|som|ton|ljud
🕳️|hole|agujero|trou|buraco|loch|hål
🫧|bubbles|burbujas|bulles|bolhas|blasen|bubblor
`;

const PER_LEVEL = 20, LEVELS = 20;

// Languages whose new audio is recorded and published. The others keep their earlier short
// word list, single wordings and nine games until their clips exist. Add a language here
// when its clips are committed.
const READY = ['en', 'sv', 'es', 'fr', 'pt'];

// The usable words of one language as [WORD, picture], in level order.
function build(lang) {
  const col = ORDER.indexOf(lang) + 1, seen = new Set(), out = [];
  TABLE.trim().split('\n').forEach((line, row) => {
    const cells = line.split('|'), w = cells[col];
    if (!w || w === '-' || seen.has(w)) return;
    if (!/^\p{L}{2,13}$/u.test(w) || /[ßœæ]/i.test(w)) return; // letters only, and nothing that cannot be typed
    seen.add(w);
    out.push({ w: w.toLocaleUpperCase(lang), e: cells[0], row });
  });
  out.sort((a, b) => a.w.length - b.w.length || a.row - b.row);
  return out.slice(0, PER_LEVEL * LEVELS).map(x => [x.w, x.e]);
}

// Texts that belong to the word levels, per language.
const EXTRA = {
  sv: { wordLevel: (lv, n) => `Ordnivå ${lv} · ${n}/20`, newWordLevel: lv => `Ny ordnivå: ${lv}!`, levelUp: 'Du har klarat alla orden och går upp en nivå!' },
  en: { wordLevel: (lv, n) => `Word level ${lv} · ${n}/20`, newWordLevel: lv => `New word level: ${lv}!`, levelUp: 'You have done all the words and move up a level!' },
  es: { wordLevel: (lv, n) => `Nivel de palabras ${lv} · ${n}/20`, newWordLevel: lv => `¡Nuevo nivel de palabras: ${lv}!`, levelUp: '¡Has completado todas las palabras y subes de nivel!' },
  fr: { wordLevel: (lv, n) => `Niveau de mots ${lv} · ${n}/20`, newWordLevel: lv => `Nouveau niveau de mots : ${lv} !`, levelUp: 'Tu as réussi tous les mots et tu montes d’un niveau !' },
  pt: { wordLevel: (lv, n) => `Nível de palavras ${lv} · ${n}/20`, newWordLevel: lv => `Novo nível de palavras: ${lv}!`, levelUp: 'Você completou todas as palavras e subiu de nível!' },
  de: { wordLevel: (lv, n) => `Wortstufe ${lv} · ${n}/20`, newWordLevel: lv => `Neue Wortstufe: ${lv}!`, levelUp: 'Du hast alle Wörter geschafft und steigst eine Stufe auf!' },
};

// `all` is set by the recording script, which needs every language's full content.
function apply(LANGS, all) {
  for (const lang of Object.keys(LANGS)) {
    const L = LANGS[lang], x = EXTRA[lang];
    L.ui.wordLevel = x.wordLevel; L.ui.newWordLevel = x.newWordLevel;
    if (!all && !READY.includes(lang)) continue;
    L.words = build(lang);
    delete L.finale;
    L.g.levelUp = x.levelUp;
  }
  return LANGS;
}

const api = { apply, build, PER_LEVEL, LEVELS, READY };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else { apply(root.LA.LANGS); root.LA.WORDS = api; root.LA.READY = READY; }
})(typeof window !== 'undefined' ? window : globalThis);
