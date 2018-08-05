let express = require('express');
let axios = require('axios');
let QRCode = require('qrcode')
let LZString = require('lz-string/libs/lz-string');
const API_KEY = '704fab8bce4ac7c0a843394f61d8d600';
const BASE_URL = 'http://api.jotform.com';
const app = express();
const port = 4001;
app.set('view engine', 'ejs');
app.route('/insta/:qry').get( async(req,res) => {
    let usersx = await axios.get(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${req.params.qry}&rank_token=0.610534939321794`);
    res.render('qrcode',{imgData : usersx})

})
app.route('/:formID').get(async (req, res) => {
    try {
        let questions = await axios.get(`${BASE_URL}/form/${req.params.formID}/questions?apiKey=${API_KEY}`);
        let properties = await axios.get(`${BASE_URL}/form/${req.params.formID}/properties?apiKey=${API_KEY}`);
        if (questions.data.responseCode == 200 && properties.data.responseCode == 200) {
            let tempQuestions = [...Object.values(questions.data.content)].map( (singleQuestion) => {
                const { qid,order,sublabels,subLabel,text,description,showQuestionCount,subHeader,type} = singleQuestion
                return { qid,order,sublabels,subLabel,text,description,showQuestionCount,subHeader,type}
            }).sort( (i1,i2) => parseInt(i1.order) >= parseInt(i2.order));
            let {welcomePage, thankYouPage, id, formStrings} = properties.data.content
            properties = {welcomePage, thankYouPage, id, formStrings}
            let resData = {
                form_id: id,
                questions: tempQuestions,
                properties,
                questionCount: tempQuestions.filter((i1) => i1.type != 'control_head').length,
                questionArrLength: tempQuestions.length
            }
            let compressedResult = LZString.compressToUTF16(JSON.stringify(resData)).trim()
            /*res.send(compressedResult)*/
            QRCode.toDataURL(compressedResult, function (err, url) {
                res.render('qrcode',{imgData : url})
            })

        } else {
            console.warn("Response Code is not 200 !")
        }

    } catch (e) {

    }

});

app.listen(port);
console.log('APP STARTED ON PORT : ' + port);