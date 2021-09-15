const {ui, network, whisper} = require('@oliveai/ldk');
const cheerio = require('cheerio');
const { last } = require('cheerio/lib/api/traversing');

const writeWhisper = (labelV, body) => {
  whisper.create({
    label: labelV,
    onClose: () => { console.log('Closed Whisper') },
    components: [
        {
            body: body,
            type: whisper.WhisperComponentType.Markdown,
        },
    ]
  });
};

const readFromUrl = async (url) => {
  const request = {
    method: 'GET',
    url: `${url}`,
  };
  const response = await network.httpRequest(request);
  const decodedBody = await network.decode(response.body);
  return decodedBody;
}

async function terminologyCallback(incomingText){
    const url = 'https://sllane.com/olivology';
    const webpageSeachStr = "Alphabetical Listing of Terms";
    const html = await readFromUrl(url);
    const $ = cheerio.load(html);
    let type;
    if (incomingText.includes(" ")){
        type = 'phrase';
    }
    else{
        type = 'word';
    }
    let answer = `I could not find the meaning of this ${type}`;
    
    let myDiv = $(`div:contains("${webpageSeachStr}")`).last()
    let res = [];
    let filtered = $(myDiv).children().filter((i, el) => {
        const text = $(el).text();
        const temp = text.split(":");
        if (temp[0] === webpageSeachStr){
          return false;
        }
        return temp[0].toLowerCase().includes(incomingText.toLowerCase());
    })

    filtered.each(function (i, e) {
        let str = $(e).text();
        res[i] = str;
    });
    answer = res.join("     \n");
    writeWhisper(`The meaning of ${incomingText}`, `${answer}`);
}

async function terminology(){
  writeWhisper("Olive Terminology Started", "Search an olivian word to retrieve the definition")
  ui.listenSearchbar(terminologyCallback);
}

terminology();