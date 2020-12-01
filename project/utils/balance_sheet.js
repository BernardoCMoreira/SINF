const assets = {
    non_current: [
      {
        name: 'Ativos fixos tangiveis',
        id: 'A00101',
        taxonomyCodes: [268, 269, 270, 271, 272, 273, 274,
                       -275, -276, -277, -278, -279, -280, -281,  
                       -282, -283, -284, -285, -286, -287, -288, 
                       306, 310, -314, -318 ],
        value: 0,
      },
      {
        name: 'Propriedades de investimento',
        id: 'A00102',
        taxonomyCodes: [259, 260, 261,
                        -262, -263, -264, -265, -266, -267, 
                        305, 309, -313, -317],
        value: 0,
      },
      {
        name: 'Goodwill',
        id: 'A00103',
        taxonomyCodes: [217, 222, 227,
                        -236, -237, -238, -240, -245, -250,
                        289, -294, -299],
        value: 0,
      },
      {
        name: 'Ativos intangiveis',
        id: 'A00104',
        taxonomyCodes: [290, 291, 292, 293, 
                        -295, -296, -297, -298, -300, -301, -302, -303, 
                        307, 311, -315, -319],
        value: 0,
      },
      {
        name: 'Ativos biológicos',
        id: 'A00105',
        taxonomyCodes: [197, 198, -200, -202, 215],
        value: 0,
      },
      {
        name: 'Participacoes financeiras - metodo da equivalencia patrimonial',
        id: 'A00106',
        taxonomyCodes: [216, 221, 226, -239, -244, -249],
        value: 0,
      },
      {
        name: 'Outros investimentos financeiros',
        id: 'A00107',
        taxonomyCodes: [218, 219, 220, 223, 224, 225, 228, 229, 230,
                        231, 232, 233, 234, 235, -241, -242, -243, 
                        -246, -247, -248, -251, -252, -253, -254, 
                        -255, -256, -257, -258, 304, 308, -312, -316],
        value: 0,
      },
      {
        name: 'Creditos a receber',
        id: 'A00108',
        taxonomyCodes: [-68, -70, 112, -121, -123, 129, -141, -145],
        ifDebt: [62, 64, 114, 125, 127, 139],
        value: 0,
      },
      {
        name: 'Ativos por impostos diferidos',
        id: 'A00109',
        taxonomyCodes: [133, -143],
        value: 0,
      },
      //Investimentos financeiros + creditos e outros ativos nao precisam de tar preenchidos
    ],
    
    current: [
      {
        name: 'Inventario',
        id: 'A00113',
        taxonomyCodes: [ 165, 166, 167, -168, -169, -170, 171, 172, 173, 
                         174, 175, 176, -177, -178, -179, -180, -181, -182,
                         183, 184, -185, -186, 187, 188, 189, -190, -191, -192,
                         193, -194, 209, 210, 211, 212, 213],
        value: 0,
      },
      {
        name: 'Ativos biológicos',
        id: 'A00114',
        taxonomyCodes: [195, 196, -199, -201, 214],
        value: 0,
      },
      {
        name: 'Clientes',
        id: 'A00115',
        taxonomyCodes: [ -24, -25, -26, -27, -28, -29, -30, -31, -32,
                        -33, -34, -35, -36],
        ifDebt: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
        value: 0,
      },
      {
        name: 'Estado e outros entes públicos',
        id: 'A00116',
        taxonomyCodes: [73, 74, 79, 80],
        ifDebt: [71, 76, 77, 82, 83, 84, 85],
        value: 0,
      },
      {
        name: 'Capital subscrito e nao realizado',
        id: 'A00117',
        taxonomyCodes: [106, 107, -115, -116],
        value: 0,
      },
      {
        name: 'Outros creditos a receber',
        id: 'A00118',
        taxonomyCodes: [51, -52, 55, 56, -65, -66, -67, -69, 108,
                        111, -117, -118, -119, -120, -122, 128,
                        130, -140, -142, -144],
        ifDebt: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
                 50, 61, 63, 109, 110, 113, 124, 126, 138],
        value: 0,
      },
      {
        name: 'Diferimentos',
        id: 'A00119',
        taxonomyCodes: [146],
        value: 0,
      },
      {
        name: 'Ativos financeiros detidos para negociacao',
        id: 'A00120',
        taxonomyCodes: [4, 6],
        value: 0,
      },
      {
        name: 'Outros ativos financeiros',
        id: 'A00121',
        taxonomyCodes: [8],
        value: 0,
      },
      {
        name: 'Ativos nao currentes detidos para venda',
        id: 'A00122',
        taxonomyCodes: [320, 321, 322, 323, 324, -326, -327, -328, -329, -330],
        value: 0,
      },
      {
        name: 'Caixa e depósitos bancários',
        id: 'A00124',
        taxonomyCodes: [1],
        ifDebt: [2, 3],
        value: 0,
      },
      //Outros ativos correntes nao precisa de ser preenchido
    ],
};

//Capital proprio
const equity = [
    {
        name: 'Capital subscrito',
        id: 'A00127',
        taxonomyCodes: [331],
        value: 0,
      },
      {
        name: 'Acoes (quotas) proprias',
        id: 'A00128',
        taxonomyCodes: [-332],
        ifCreditOrDebit: [333],
        value: 0,
      },
      {
        name: 'Outros instrumentos de capital proprio',
        id: 'A00129',
        taxonomyCodes: [334],
        value: 0,
      },
      {
        name: 'Premios de emissao',
        id: 'A00130',
        taxonomyCodes: [335],
        value: 0,
      },
      {
        name: 'Reservas legais',
        id: 'A00131',
        taxonomyCodes: [336],
        value: 0,
      },
      {
        name: 'Outras reservas',
        id: 'A00132',
        taxonomyCodes: [337],
        value: 0,
      },
      {
        name: 'Resultados transitados',
        id: 'A00133',
        taxonomyCodes: [],
        ifCreditOrDebit: [338],
        value: 0,
      },
      {
        name: 'Excedentes de revalorizacao',
        id: 'A00134',
        taxonomyCodes: [343, -344, 345, -346],
        value: 0,
      },
      {
        name: 'Ajustamentos / outras variacoes no capital proprio',
        id: 'A00135',
        taxonomyCodes: [349, -350, 351],
        ifCreditOrDebit: [339, 340, 341, 342, 347, 348, 352],
        value: 0,
      },
      {
        name: 'Resultado liquido do periodo',
        id: 'A00137',
        taxonomyCodes: [],
        ifCreditOrDebit: [646],
        value: 0,
      },
      {
        name: 'Dividendos antecipados',
        id: 'A00138',
        taxonomyCodes: [-647],
        value: 0,
      },
];

//Passivo
const liabilities = {
    nonCurrent: [
        {
            name: 'Provisoes',
            id: 'A00140',
            taxonomyCodes: [148, 149, 150, 151, 152, 153, 154, 155],
            value: 0,
          },
          {
            name: 'Financiamentos obtidos',
            id: 'A00141',
            taxonomyCodes: [87, 89, 91, 93, 95, 97, 99, 101, 103, 105],
            value: 0,
          },
          {
            name: 'Responsabilidades por beneficios pos-emprego',
            id: 'A00142',
            taxonomyCodes: [132],
            value: 0,
          },
          {
            name: 'Passivos por impostos diferidos',
            id: 'A00143',
            taxonomyCodes: [134],
            value: 0,
          },
          {
            name: 'Outras dividas a pagar',
            id: 'A00144',
            taxonomyCodes: [58, 60, 136],
            ifCredit: [62, 64, 114, 125, 127, 139],
            value: 0,
          },
    ],
    current: [
        {
            name: 'Fornecedores',
            id: 'A00146',
            taxonomyCodes: [],
            ifCredit: [
              37, 38, 39, 40, 41, 42, 43, 
              44, 45, 46, 47, 48, 49, 50,
            ],
            value: 0,
          },
          {
            name: 'Adiantamentos de clientes',
            id: 'A00147',
            taxonomyCodes: [23, 137],
            ifCredit: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
            value: 0,
          },
          {
            name: 'Estado e outros entes publicos',
            id: 'A00148',
            taxonomyCodes: [72, 75, 78],
            ifCredit: [71, 76, 77, 81, 82, 83, 84, 85],
            value: 0,
          },
          {
            name: 'Financiamentos obtidos',
            id: 'A00149',
            taxonomyCodes: [86, 88, 90, 92, 94, 96, 98, 100, 102, 104],
            ifCredit: [2, 3],
            value: 0,
          },
          {
            name: 'Outras dividas a pagar',
            id: 'A00150',
            taxonomyCodes: [53, 54, 57, 59, 131, 135],
            ifCredit: [61, 63, 109, 110, 113, 124, 126, 138],
            value: 0,
          },
          {
            name: 'Diferimentos',
            id: 'A00151',
            taxonomyCodes: [147],
            value: 0,
          },
          {
            name: 'Passivos financeiros detidos para negociação',
            id: 'A00152',
            taxonomyCodes: [5, 7],
            value: 0,
          },
          {
            name: 'Outros passivos financeiros',
            id: 'A00153',
            taxonomyCodes: [9],
            value: 0,
          },
          {
            name: 'Passivos não currentes detidos para venda',
            id: 'A00154',
            taxonomyCodes: [325],
            value: 0,
          },
    ],
};

module.exports.assets = assets;
module.exports.liabilities = liabilities;
module.exports.equity = equity;
