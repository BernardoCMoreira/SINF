const xml2js = require('xml2js');
const fs = require('fs');
require('dotenv/config');

module.exports = {
    parse: function(){
        const xml = fs.readFileSync('./saft/' + process.env.SAFT_FILE);
        // convert XML to JSON
        xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
            if (err) {
                throw err;
            }

            parsedContent = result.AuditFile;
            delete parsedContent['xmlns:xsi'];
            delete parsedContent['xmlns:xsd'];
            delete parsedContent['xsi:schemaLocation'];
            delete parsedContent.xmlns;

            // `result` is a JavaScript object -> convert it to a JSON string
            const json = JSON.stringify(result, null, 4);

            // save JSON in a file
            fs.writeFileSync('saft.json', json);
        });
    }
}