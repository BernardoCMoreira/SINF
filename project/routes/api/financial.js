require('dotenv/config');
const { json } = require('express');
var express = require('express');
var router = express.Router();
var app = require("../../app"); //Info vai estar na db


router.get('/financial/assets', (req, res) => {
    var server = app.db; // Para usar a db
    const accounts = server.AuditFile.MasterFiles[0].GeneralLedgerAccounts[0].Account;
    const assets = calculateAssets(accounts);

    console.log(assets);
});

function calculateAssets(accounts) {
    const assets = {
        current: [],
        non_current: [],
        total_current: 0,
        total_non_current: 0
    };


    return assets;
}

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

module.exports = router;