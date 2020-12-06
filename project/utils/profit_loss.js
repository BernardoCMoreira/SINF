const revenue = [
  {
    name: "Vendas e serviços prestados",
    id: "A00001",
    taxonomyCodes: [506, 507, 508, 509, -511, -512, 513, 514, 515, 516, -518],
    ifCreditOrDebit: [510, 517],
  },
  {
    name: "Subsidios a exploracao",
    id: "A00002",
    taxonomyCodes: [527, 528],
  },
  {
    name:
      "Ganhos / perdas imputadas de subsidiarias, associadas e empreendimentos conjuntos",
    id: "A00003",
    taxonomyCodes: [614, 615, 616, 638, 639, -479, -480, -481, -482],
  },
  {
    name: "Variacao nos inventarios da producao",
    id: "A00004",
    taxonomyCodes: [],
    ifCreditOrDebit: [519, 520, 521, 522],
  },
  {
    name: "Trabalhos para a propria entidade",
    id: "A00005",
    taxonomyCodes: [523, 524, 525, 526],
  },

  {
    name: "Aumentos / reducoes de justo valor",
    id: "A00015",
    taxonomyCodes: [
      594,
      595,
      596,
      597,
      598,
      599,
      600,
      601,
      602,
      -454,
      -455,
      -456,
      -457,
      -458,
      -459,
      -460,
      -461,
      -462,
    ],
  },
  {
    name: "Outros rendimentos",
    id: "A00016",
    taxonomyCodes: [
      603,
      604,
      605,
      606,
      607,
      608,
      609,
      610,
      611,
      612,
      613,
      617,
      618,
      619,
      620,
      621,
      622,
      623,
      624,
      625,
      626,
      627,
      628,
      629,
      630,
      631,
      632,
      633,
      634,
      636,
      637,
      640,
      642,
    ],
  },
];

const expenses = [
  {
    name: "Custo das mercadorias vendidas e das materias consumidas",
    id: "A00006",
    taxonomyCodes: [353, 354, 355],
  },
  {
    name: "Fornecimentos e servicos externos",
    id: "A00007",
    taxonomyCodes: [
      356,
      357,
      358,
      359,
      360,
      361,
      362,
      363,
      364,
      365,
      366,
      367,
      368,
      369,
      370,
      371,
      372,
      373,
      374,
      375,
      376,
      377,
      378,
      379,
      380,
      381,
      382,
      383,
      384,
    ],
  },
  {
    name: "Gastos com o pessoal",
    id: "A00008",
    taxonomyCodes: [385, 386, 389, 390, 391, 392, 393],
    ifCreditOrDebit: [387, 388],
  },
  {
    name: "Imparidade / ajustamentos de inventarios (perdas / reversoes)",
    id: "A00010",
    taxonomyCodes: [
      415,
      416,
      417,
      418,
      419,
      420,
      421,
      -549,
      -550,
      -551,
      -552,
      -553,
      -554,
      -555,
    ],
  },
  {
    name: "Imparidade de dividas a receber (perdas / reversoes)",
    id: "A00011",
    taxonomyCodes: [413, 414, -547, -548],
  },
  {
    name: "Provisoes (aumentos / reducoes)",
    id: "A00012",
    taxonomyCodes: [
      463,
      464,
      465,
      466,
      467,
      468,
      469,
      470,
      -586,
      -587,
      -588,
      -589,
      -590,
      -591,
      -592,
      -593,
    ],
  },
  {
    name:
      "Imparidade de investimentos nao depreciaveis / amortizaveis (perdas / reversoes)",
    id: "A00013",
    taxonomyCodes: [
      422,
      423,
      424,
      425,
      441,
      442,
      443,
      444,
      445,
      446,
      447,
      448,
      449,
      450,
      451,
      452,
      453,
      -556,
      -557,
      -558,
      -573,
      -574,
      -575,
      -576,
      -577,
      -578,
      -579,
      -580,
      -581,
      -582,
      -583,
      -584,
      -585,
    ],
    ifCreditOrDebit: [412],
  },
  {
    name: "Outros gastos",
    id: "A00017",
    taxonomyCodes: [
      471,
      472,
      473,
      474,
      475,
      476,
      477,
      478,
      483,
      484,
      485,
      486,
      487,
      488,
      489,
      490,
      491,
      492,
      493,
      494,
      495,
      496,
      497,
      498,
      499,
    ],
  },
];

const depreciation = [
  {
    name: "Gastos / reversoes de depreciacao e de amortizacao",
    id: "A00019",
    taxonomyCodes: [
      394,
      395,
      396,
      397,
      398,
      399,
      400,
      401,
      402,
      403,
      404,
      405,
      406,
      407,
      408,
      409,
      410,
      411,
      -529,
      -530,
      -531,
      -532,
      -533,
      -534,
      -535,
      -536,
      -537,
      -538,
      -539,
      -540,
      -541,
      -542,
      -543,
      -544,
      -545,
      -546,
    ],
  },
  {
    name:
      "Imparidade de investimentos depreciaveis / amortizaveis (perdas / reversoes)",
    id: "A00020",
    taxonomyCodes: [
      426,
      427,
      428,
      429,
      430,
      431,
      432,
      433,
      434,
      435,
      436,
      437,
      438,
      439,
      440,
      -559,
      -560,
      -561,
      -562,
      -563,
      -564,
      -565,
      -566,
      -567,
      -568,
      -569,
      -570,
      -571,
      -572,
    ],
  },
];

const interest = [
  {
    name: "Juros e rendimentos similares obtidos",
    id: "A00022",
    taxonomyCodes: [635, 641],
  },
  {
    name: "Juros e gastos similares suportados",
    id: "A00023",
    taxonomyCodes: [500, 501, 502, 503, 504, 505],
  },
];

const taxes = [
  {
    name: "Imposto sobre o rendimento do periodo",
    id: "A00025",
    taxonomyCodes: [644],
    ifCreditOrDebit: [645],
  },
];

const ebit = 0;
const ebitda = 0;
const netIncome = 0;

module.exports.revenue = revenue;
module.exports.expenses = expenses;
module.exports.depreciation = depreciation;
module.exports.interest = interest;
module.exports.taxes = taxes;
module.exports.ebit = ebit;
module.exports.ebitda = ebitda;
module.exports.netIncome = netIncome;
