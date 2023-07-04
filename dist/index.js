"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// artifacts/verification_key.json
var require_verification_key = __commonJS({
  "artifacts/verification_key.json"(exports, module2) {
    module2.exports = {
      protocol: "groth16",
      curve: "bn128",
      nPublic: 64,
      vk_alpha_1: [
        "20491192805390485299153009773594534940189261866228447918068658471970481763042",
        "9383485363053290200918347156157836566562967994039712273449902621266178545958",
        "1"
      ],
      vk_beta_2: [
        [
          "6375614351688725206403948262868962793625744043794305715222011528459656738731",
          "4252822878758300859123897981450591353533073413197771768651442665752259397132"
        ],
        [
          "10505242626370262277552901082094356697409835680220590971873171140371331206856",
          "21847035105528745403288232691147584728191162732299865338377159692350059136679"
        ],
        [
          "1",
          "0"
        ]
      ],
      vk_gamma_2: [
        [
          "10857046999023057135944570762232829481370756359578518086990519993285655852781",
          "11559732032986387107991004021392285783925812861821192530917403151452391805634"
        ],
        [
          "8495653923123431417604973247489272438418190587263600148770280649306958101930",
          "4082367875863433681332203403145435568316851327593401208105741076214120093531"
        ],
        [
          "1",
          "0"
        ]
      ],
      vk_delta_2: [
        [
          "10115973684452513217509427206221325711061891332914963578427495724761260771492",
          "20238774318594015892369581390909562603087882763643989204526931947159691426996"
        ],
        [
          "3001961423224617685645367675296130273719728929015832210331680318473351555853",
          "21456723783889434779003750041264756964874633740027938615656777201261497407815"
        ],
        [
          "1",
          "0"
        ]
      ],
      vk_alphabeta_12: [
        [
          [
            "2029413683389138792403550203267699914886160938906632433982220835551125967885",
            "21072700047562757817161031222997517981543347628379360635925549008442030252106"
          ],
          [
            "5940354580057074848093997050200682056184807770593307860589430076672439820312",
            "12156638873931618554171829126792193045421052652279363021382169897324752428276"
          ],
          [
            "7898200236362823042373859371574133993780991612861777490112507062703164551277",
            "7074218545237549455313236346927434013100842096812539264420499035217050630853"
          ]
        ],
        [
          [
            "7077479683546002997211712695946002074877511277312570035766170199895071832130",
            "10093483419865920389913245021038182291233451549023025229112148274109565435465"
          ],
          [
            "4595479056700221319381530156280926371456704509942304414423590385166031118820",
            "19831328484489333784475432780421641293929726139240675179672856274388269393268"
          ],
          [
            "11934129596455521040620786944827826205713621633706285934057045369193958244500",
            "8037395052364110730298837004334506829870972346962140206007064471173334027475"
          ]
        ]
      ],
      IC: [
        [
          "17026036236231437358733265817740106829588585937929863663337625048296520783483",
          "15790591807608792346598852605332431122302802886153346677185817920577333409431",
          "1"
        ],
        [
          "20926427196237654078995485095259901157378262525000623220466364747124233265873",
          "13214923705722286888327788528438720508549814950611801098536821002492959137477",
          "1"
        ],
        [
          "11771813250088985907439236705620098924912705858978778333500475875098800778055",
          "11878424298687393847217419960319924276667915991241236828934735626896092949463",
          "1"
        ],
        [
          "2360668857431531693594388927880487928698152455773561561363566820804688632961",
          "10695609165923549037196740618464942509425567235791845139873610803924897445032",
          "1"
        ],
        [
          "19286571739828304345045017398393330915659761810659500669339590916536681771629",
          "6877441234655114293032990629586179956624362562063481079850433213467276895018",
          "1"
        ],
        [
          "910876011254505593361748406109876847988213200998886431649890125897465506692",
          "16061034988297386356851533537153292151948605700791717774071760123245751101758",
          "1"
        ],
        [
          "12910725970079937086931230383383283081126086205744036266415365035086308554126",
          "7753288845130222156346205564200402995136619368604609332400603617224262005823",
          "1"
        ],
        [
          "11721805286119358964445480283232632291373153885492125828592495694769437076934",
          "25531647265350339548867364303416166859718058354528110973028148423120539866",
          "1"
        ],
        [
          "10606370822781597359592028676179779275633194997892057019771009745863137606004",
          "9504997196023544059108043193054031048491805127720828822082244100856280839715",
          "1"
        ],
        [
          "17468538927365750052284157138737833573747910489301167687360460566287658177701",
          "11810183526680811175469762790922392522398114075971925981324909350352452806261",
          "1"
        ],
        [
          "14521457500932917728318845546333949879100397134103522815260851803011776201039",
          "13738460237244817637665015020863481248668652730307739884320576977934409001644",
          "1"
        ],
        [
          "8757162181595773098462822198642950279803936820366390679514400878856634685893",
          "10985044214338293340257735204260466183076496410957654948456631830669360296642",
          "1"
        ],
        [
          "4601857214078226307371751358190916792847142497989838713806273457682840578572",
          "15730213044831996438837523510901253382483027032831466383843531954130478238799",
          "1"
        ],
        [
          "10676200630943671707532047179867958759948437618485255052375486638272353349449",
          "4688579556008423987340575282433271941131077528165953759902020881128192473414",
          "1"
        ],
        [
          "14651862981553210304114343453722990913248985120993502341725105556945838318528",
          "8887685537865361458796939199593040641631468275257059160774125152864040486466",
          "1"
        ],
        [
          "5845932743544929936616418208600999405200958567177841575061629609006062025006",
          "4859963657774958819252168549307639342360724719080909854452933191985524044723",
          "1"
        ],
        [
          "14679875372868688469511618451656884084489435078159976910868290487766896375734",
          "21233174336959457987808251393235430146126816604769053237815680111385460691331",
          "1"
        ],
        [
          "2648069208700711230401912064036784768183334479289454662925814432758614160728",
          "20039371057814599602421392102617086099631119643613517603813272779702639210594",
          "1"
        ],
        [
          "4115325948360396452250528745995103932222702047849044888294046538540857937112",
          "12841377434964538198348274032747962207557741263179312074357603510494593858104",
          "1"
        ],
        [
          "14206586037272956186637134559460436826676554657802013986509688587337714625132",
          "9528815909868854096893593632363121221292814479294876149878097427461410448712",
          "1"
        ],
        [
          "18301511004341748187020494596668637554348758640057765193578028578202722047962",
          "10692436075486068525151181159210850160061745190561514637875655824715928460187",
          "1"
        ],
        [
          "5808716022400045797232819037533609984479310975499947522552554869868077697907",
          "1422387483704043626266348090980759525020472252776632632737959542529944459319",
          "1"
        ],
        [
          "9657674931104355052878381662889793848216383754496732633862207129128312516391",
          "1571751509344121627130074302556983626202433500818822988378984374559168045758",
          "1"
        ],
        [
          "4122050733020621430706673255280813095540187534346889631821316520048447225096",
          "5968944732324604795419804471113788049519667154132803259617285833478493635841",
          "1"
        ],
        [
          "12834786615563722518106890138952774388040507173845531991799063753476430597843",
          "14235147081017055131411191122386816093139336729851546700720954787910947408868",
          "1"
        ],
        [
          "1403020115751029659040614450682193054991828639836836753290080069691041933462",
          "17670403385125809151829595373226578902348984653395804606367844889066142363918",
          "1"
        ],
        [
          "5828577632944265316902245196082291110834196940762596039782330319420777317559",
          "8260341376673285520776241967121796506963254679359706116673851758904205805726",
          "1"
        ],
        [
          "5894151147117197766313810500084713802921619000962029206854621455472242810038",
          "14973916575089854461934671265550873597460964656464611631453686229201824124368",
          "1"
        ],
        [
          "2054618315816464858217069849458797726158265169914217518681715189798179991373",
          "18209872590767737619684855832957482869545793436413673720646227379250873885803",
          "1"
        ],
        [
          "6503784465610211716269910958198069224551616888162105101678878090434654342505",
          "9577546184417443044394055202934203471923530675252741830948157288392495475674",
          "1"
        ],
        [
          "19973008827550741492195390275990097040265687051176415904717533718370971824227",
          "6241517534151573811237615163406873576445346549494135387041242715102071803569",
          "1"
        ],
        [
          "7448627107229325828795766113166560374841256351975612191400690039470311238532",
          "10182440919970024727112458335383479456841019652466140408857909296514913752387",
          "1"
        ],
        [
          "19221112175826353490882505734844791892667342074055997051428154501689671096031",
          "1151851170558791220898528808305187186466876166175883297718960910851310494351",
          "1"
        ],
        [
          "17120735484289521489356176524366514297558651699304034525933475921800042338531",
          "11241691258982241860411697363163987827876884332216950373809338339896111461103",
          "1"
        ],
        [
          "2551027079533116490270060805305652938935296362154889369236697597396332822180",
          "7297579431023654727499049506192960114845425359353294017378022581175826963023",
          "1"
        ],
        [
          "6684708092201757689611288478372345661313062845310496774081193661757816133856",
          "5045754191110747621397313456743128217369048898726011612852769948773239915054",
          "1"
        ],
        [
          "12338489783653094808005582709627623212435125587094847843453722231789626903212",
          "13744284071182542251686169141973032206322640139057433815891394994753699695590",
          "1"
        ],
        [
          "11481015629718866208649278568193004627211670104757614099331479607506121063401",
          "3165663178042482403749980134474895100601044172440972379250884987353832993552",
          "1"
        ],
        [
          "496695957644494676196551496849267408948615064282460720978033591792587903472",
          "1631098570144254133669654772431990130983848671725506012633824757728496999471",
          "1"
        ],
        [
          "1744459353669802578626229493308844340684797857178350928290960348675943864207",
          "8149617369168291751222120632591528046224468873304262250375731734398241797542",
          "1"
        ],
        [
          "4571637922909254065514265245195289945962921398815438436153719069329172342688",
          "8510384128916365489681040912810182067688081323068968860026302207582288387578",
          "1"
        ],
        [
          "19327788892305461036709664905120164465473585053946528489273051550632802752257",
          "704700077918883651230281251558474329940293700051170648555297839128083626673",
          "1"
        ],
        [
          "12713619930526901142962106641342555947497853195644200570656844510658294664217",
          "6693711795811198911484018418701725303382613993857238730079736995606392623953",
          "1"
        ],
        [
          "4177877767058830555953539396859478102681612008829397563991823275109294161957",
          "5682937849546789595919184894106642583246586190935362707697210350547309667068",
          "1"
        ],
        [
          "9673147076839712157440909633288166212408230702614709093099594583301495817863",
          "16397968372243632721393938956359098003961896673475727763333041974492674695559",
          "1"
        ],
        [
          "9679946185283065635370816999295722070859223668582483080616910012175917005194",
          "21688842472603670462626038272917917570757906055868461030014604926227959356282",
          "1"
        ],
        [
          "17489056591003250829318471722682737048535982610002656900341405442018721176116",
          "3320785369975189881515024781371557690753971288842580556294903568088202917834",
          "1"
        ],
        [
          "14959013361361966316423484856053141384313846429294404266975512074318201253622",
          "16560556115564374676923527844826365586107227889291222412236873727903580522147",
          "1"
        ],
        [
          "5667771134991575352330369327023192176280865794385559494878424738824636630918",
          "10494573205012743296982537112453181135024683334729357020462401907741360506367",
          "1"
        ],
        [
          "11489743604386136759588846467600018893862152052978506077938550320032385628451",
          "13134306352930470044634755600280170683323662069411988822328688341024640493103",
          "1"
        ],
        [
          "3988987073673399974150079254845014479224283931704812430441822197755662713673",
          "7622408597982060393895122891639096035337509698478008824447938430437562937505",
          "1"
        ],
        [
          "17803177315405834355464784337730575940171904656791071929881897952195407553056",
          "7799676846481931322838101276435910469873165111261864396017392828299988655876",
          "1"
        ],
        [
          "12590541915476792843934407213248732766308135509822245291962048751380782536271",
          "18755203057958762605644253048145154577642483125174375083934295397087341107773",
          "1"
        ],
        [
          "14784261057701549667432426982301306920721360305642821976614134200071787785587",
          "6735226368231017346447141606574925211480716165367005827486210542675902093278",
          "1"
        ],
        [
          "10149558837126189327395301383031052295535015960537517345444487898964541488721",
          "11260563737022988146874056714095089873735317920528176121588280758938929841400",
          "1"
        ],
        [
          "10527803619207066793276811643943521368179927280719320984175588412090485515358",
          "4162459335348203147563941989950000933795292231886121614775356029395130361659",
          "1"
        ],
        [
          "14602867289835262832559485193579505723453634459280349024839377294977801541744",
          "15431012665293221200275177998163679415910116598288794446765409435364608147218",
          "1"
        ],
        [
          "7974910040862776381992723511189013170786898118953615257834882680517667301622",
          "2878901474050979523337563358159062324725433994680311727034623040318260140510",
          "1"
        ],
        [
          "8841798330059432355476970553366937202021160577459635233730786912074934049098",
          "16427956934161263404099411238562809425718850552222966716633508515108412866100",
          "1"
        ],
        [
          "1095128299883089904344121039628717200201725293745931339468082847836801156081",
          "8622613148350654633422027847457436694826260309375761486690345606692122183900",
          "1"
        ],
        [
          "4421167888275071993661674319132537903774147163522148315528858367874359559649",
          "9865960043537544521516135337469377417615608658081288159865302814701213383357",
          "1"
        ],
        [
          "20273892125386044861061483068656268907448931799493331974250110283134148690487",
          "6650495285879969322628525722627636582920236757802152970876452066354250630484",
          "1"
        ],
        [
          "20811743730113544781787974920468280659799762984151064241493985650122209109466",
          "10267496405635320993924066599098140563832868312718386318135592950582037071",
          "1"
        ],
        [
          "20134721946405163634454266833078159092127962375015278630406354622795670651123",
          "2511811320888375084729146202220322890631225407283024814320010094969698730235",
          "1"
        ],
        [
          "13639109025617591154080376664231917235669030176219760390331237004748980097441",
          "10320698209039536618761809077477321846668804348832414434950904026644492779270",
          "1"
        ]
      ]
    };
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  IdentityPCD: () => IdentityPCD,
  IdentityPCDPackage: () => IdentityPCDPackage,
  IdentityPCDTypeName: () => IdentityPCDTypeName,
  deserialize: () => deserialize,
  extractSignatureFromPDF: () => extractSignatureFromPDF,
  getDisplayOptions: () => getDisplayOptions,
  init: () => init,
  packProof: () => packProof,
  prove: () => prove,
  serialize: () => serialize,
  splitToWords: () => splitToWords,
  unpackProof: () => unpackProof,
  verify: () => verify
});
module.exports = __toCommonJS(src_exports);

// src/types.ts
var IdentityPCDTypeName = "identity-pcd";

// src/pcd.ts
var import_uuid = require("uuid");
var import_snarkjs2 = require("snarkjs");

// src/utils.ts
function extractSignatureFromPDF() {
  throw new Error("Not implement yet");
}
function splitToWords(number, wordsize, numberElement) {
  let t = number;
  const words = [];
  for (let i = BigInt(0); i < numberElement; ++i) {
    const baseTwo = 2n;
    words.push(`${t % baseTwo ** wordsize}`);
    t = BigInt(t / 2n ** wordsize);
  }
  if (!(t == BigInt(0))) {
    throw `Number ${number} does not fit in ${(wordsize * numberElement).toString()} bits`;
  }
  return words;
}
function packProof(originalProof) {
  return [
    originalProof.pi_a[0],
    originalProof.pi_a[1],
    originalProof.pi_b[0][1],
    originalProof.pi_b[0][0],
    originalProof.pi_b[1][1],
    originalProof.pi_b[1][0],
    originalProof.pi_c[0],
    originalProof.pi_c[1]
  ];
}
function unpackProof(proof) {
  return {
    pi_a: [proof[0], proof[1]],
    pi_b: [
      [proof[3], proof[2]],
      [proof[5], proof[4]]
    ],
    pi_c: [proof[6], proof[7]],
    protocol: "groth16",
    curve: "bn128"
  };
}

// src/CardBody.tsx
var import_styled_components = __toESM(require("styled-components"));
var import_passport_ui = require("@pcd/passport-ui");
var import_jsx_runtime = require("react/jsx-runtime");
function IdentityPCDCardBody({ pcd }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Container, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This PCD represents an identity signal in the context of the Aadhaar card program. In other words, this is a ZK proof that you're an indian citizen and have an Aadhaar card." }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_passport_ui.Separator, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_passport_ui.FieldLabel, { children: "Exp" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_passport_ui.TextContainer, { children: pcd.claim.exp.toString() }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_passport_ui.Spacer, { h: 8 }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_passport_ui.FieldLabel, { children: "Mod" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_passport_ui.TextContainer, { children: pcd.claim.mod.toString() }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_passport_ui.Spacer, { h: 8 })
  ] });
}
var Container = import_styled_components.default.div`
  padding: 16px;
  overflow: hidden;
  width: 100%;
`;

// src/prover.ts
var import_valid_url = require("valid-url");
var import_axios = __toESM(require("axios"));
var import_snarkjs = require("snarkjs");
async function fetchKey(keyURL) {
  if ((0, import_valid_url.isWebUri)(keyURL)) {
    const keyData = await (await import_axios.default.get(keyURL)).data;
    const keyBin = Buffer.from(keyData);
    return keyBin;
  }
  return keyURL;
}
var KeyPath = class {
  constructor(keyURL, isLocation) {
    this.keyURL = keyURL;
    this.isLocation = isLocation;
  }
  async getKey() {
    if (this.isLocation)
      return this.keyURL;
    return await fetchKey(this.keyURL);
  }
};
var BackendProver = class {
  constructor(wasmURL, zkey) {
    this.wasm = new KeyPath(wasmURL, false);
    this.zkey = new KeyPath(zkey, false);
  }
  async proving(witness) {
    if (!witness.mod.value) {
      throw new Error("Cannot make proof: missing mod");
    }
    if (!witness.exp.value) {
      throw new Error("Cannot make proof: missing exp");
    }
    if (!witness.signature.value) {
      throw new Error("Cannot make proof: missing signature");
    }
    if (!witness.message.value) {
      throw new Error("Cannot make proof: missing message");
    }
    const input = {
      sign: splitToWords(BigInt(witness.signature.value), 64n, 32n),
      exp: splitToWords(BigInt(65337), 64n, 32n),
      modulus: splitToWords(BigInt(witness.mod.value), 64n, 32n),
      hashed: splitToWords(BigInt(witness.message.value), 64n, 3n)
    };
    const { proof } = await import_snarkjs.groth16.fullProve(
      input,
      await this.wasm.getKey(),
      await this.zkey.getKey()
    );
    return {
      exp: witness.exp.value,
      mod: witness.mod.value,
      proof
    };
  }
};
var WebProver = class {
  constructor(wasmURL, zkey) {
    this.wasm = new KeyPath(wasmURL, true);
    this.zkey = new KeyPath(zkey, true);
  }
  async proving(witness) {
    const wasmBuffer = await this.wasm.getKey();
    const zkeyBuffer = await this.zkey.getKey();
    if (!witness.mod.value) {
      throw new Error("Cannot make proof: missing mod");
    }
    if (!witness.exp.value) {
      throw new Error("Cannot make proof: missing exp");
    }
    if (!witness.signature.value) {
      throw new Error("Cannot make proof: missing signature");
    }
    if (!witness.message.value) {
      throw new Error("Cannot make proof: missing message");
    }
    const input = {
      sign: splitToWords(BigInt(witness.signature.value), 64n, 32n),
      exp: splitToWords(BigInt(65337), 64n, 32n),
      modulus: splitToWords(BigInt(witness.mod.value), 64n, 32n),
      hashed: splitToWords(BigInt(witness.message.value), 64n, 3n)
    };
    const { proof } = await import_snarkjs.groth16.fullProve(
      input,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
    );
    return {
      exp: witness.exp.value,
      mod: witness.mod.value,
      proof
    };
  }
};

// src/pcd.ts
var IdentityPCD = class {
  constructor(id, claim, proof) {
    this.type = IdentityPCDTypeName;
    this.id = id;
    this.claim = claim;
    this.proof = proof;
  }
};
var initArgs = void 0;
async function init(args) {
  initArgs = args;
}
async function prove(args) {
  if (!initArgs) {
    throw new Error(
      "cannot make semaphore signature proof: init has not been called yet"
    );
  }
  if (!args.exp.value || !args.mod.value) {
    throw new Error("Invalid arguments");
  }
  const id = (0, import_uuid.v4)();
  const pcdClaim = {
    exp: args.exp.value,
    mod: args.mod.value
  };
  let prover;
  if (initArgs.isWebEnv) {
    prover = new WebProver(initArgs.wasmURL, initArgs.zkeyURL);
  } else {
    prover = new BackendProver(initArgs.wasmURL, initArgs.zkeyURL);
  }
  const pcdProof = await prover.proving(args);
  return new IdentityPCD(id, pcdClaim, pcdProof);
}
function getVerifyKey() {
  const verifyKey = require_verification_key();
  return verifyKey;
}
async function verify(pcd) {
  const vk = getVerifyKey();
  return import_snarkjs2.groth16.verify(
    vk,
    [
      ...splitToWords(BigInt(65337), 64n, 32n),
      ...splitToWords(BigInt(pcd.proof.mod), 64n, 32n)
    ],
    pcd.proof.proof
  );
}
function serialize(pcd) {
  return Promise.resolve({
    type: IdentityPCDTypeName,
    pcd: JSON.stringify({
      type: pcd.type,
      id: pcd.id,
      claim: pcd.claim
    })
  });
}
function deserialize(serialized) {
  return JSON.parse(serialized);
}
function getDisplayOptions(pcd) {
  return {
    header: "Country Identity Signature",
    displayName: "pcd-" + pcd.type
  };
}
var IdentityPCDPackage = {
  name: IdentityPCDTypeName,
  renderCardBody: IdentityPCDCardBody,
  getDisplayOptions,
  prove,
  init,
  verify,
  serialize,
  deserialize
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IdentityPCD,
  IdentityPCDPackage,
  IdentityPCDTypeName,
  deserialize,
  extractSignatureFromPDF,
  getDisplayOptions,
  init,
  packProof,
  prove,
  serialize,
  splitToWords,
  unpackProof,
  verify
});
