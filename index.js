//const testFolder = './data/Szakv.18-19';
const testFolder = './data/Iskolaé.18-19';

const fs = require('fs');

const maleDict = fs.readFileSync('./data/male_names.txt', "utf-8").split("\r\n");
const femaleDict = fs.readFileSync('./data/female_names.txt', "utf-8").split("\r\n");

const fastcsv = require('fast-csv');
const ws = fs.createWriteStream("out.csv");

const mammoth = require('mammoth');
const pretty = require('pretty');

const Gyerek = {
    nev: '',
    lakcim: '',
    nem: '',
    kecskemeti: '',
    intezmeny:'',
    kor:'',
    szuletesi_hely:'',
    szuletesi_ido:'',
    tanulasi_nehezseg: '',
    magatartasi_nehezseg:'',
    jelentkezes_oka: ''
};

const data = [];

fs.readdir(testFolder, async (err, files) => {
    const size = files.length;
    var counter = 0;

    for(const file of files){

        let matcher = file.match(/\D+(.+)/)[1];
        let gy = Object.create( Gyerek );
        gy.nev = file.match(/\D+/)[0];
        //gy.nev = file.substr(3).match(/\D+/)[0];
        gy.tanulasi_nehezseg = (matcher.includes('TN') || matcher.includes('BTM')) ? 'igen' : 'nem';
        gy.magatartasi_nehezseg = matcher.includes('BN') ? 'igen' : 'nem';

        const { value, messages } = await mammoth.convertToHtml({ path: testFolder + '/' + file });
        const text = pretty(value).replace(/<\/strong>/g, '');;

        matcher = text.match(/(?<=tartózkodási helye:)(.*)(<\/p>)/);
        gy.lakcim = matcher ? matcher[1].trim() : '';
        matcher = text.match(/(?<=Nevelési-oktatási intézménye:)(.*)(<\/p>)/);
        gy.intezmeny = matcher ? matcher[1].trim() : '';
        matcher = text.match(/(?<=Életkora a vizsgálat időpontjában:)(.*)( év)/);
        gy.kor = matcher ? +matcher[1].trim() : '';
        matcher = text.match(/(?<=Születési hely, idő:)(.*)(\,)(.*)<\/p>/);
        gy.szuletesi_hely = matcher ? matcher[1].trim() : '';
        gy.szuletesi_ido = matcher ? matcher[3].trim() : '';

        let name = gy.nev.split(' ');

        for (var part of name) {
            part = part.toLowerCase();
            part = part.charAt(0).toUpperCase() + part.slice(1);

            if (femaleDict.includes(part)) {
                gy.nem = 'lány';
                break;
            } else if (maleDict.includes(part)) {
                gy.nem = 'fiú';
                break;
            }else{
                gy.nem = '';
            }
        }

        //if(gy.nem===''){console.log(name, part)}

        data.push(gy);
        counter++;

        console.log(size, counter);
        
        /*if(gy.lakcim==='')
            console.log(file);*/
    }

    fastcsv.write(data, { headers: true, delimiter: ';' }).pipe(ws);
});



/*

//for testing
readDocx('Vv.Amasits Petra19 SzV-KD-co_4.docx');

async function readDocx(filename){
    const { value, messages} = await mammoth.convertToHtml({ path: testFolder + '/'+filename });
    const text = pretty(value).replace(/<\/strong>/g,'');
    
    //console.log(text);
    let matcher = text.match(/(?<=tartózkodási helye:)(.*)(<\/p>)/);
    console.log(matcher ? matcher[1].trim(): '');
    matcher = text.match(/(?<=Nevelési-oktatási intézménye:)(.*)(<\/p>)/);
    console.log(matcher ? matcher[1].trim() : '');
    matcher = text.match(/(?<=Életkora a vizsgálat időpontjában:)(.*)( év)/);
    console.log(matcher ? matcher[1].trim() : '');
    matcher = text.match(/(?<=Születési hely, idő:)(.*)(\,)(.*)<\/p>/);
    console.log(matcher ? matcher[1].trim() : '');
    console.log(matcher ? matcher[3].trim() : '');
}

*/