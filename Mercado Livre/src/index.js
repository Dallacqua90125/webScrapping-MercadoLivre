const puppeteer = require('puppeteer');
const { produtos } = require('./produtos');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    async function searchProduct(produto) {
        await page.goto('https://www.mercadolivre.com.br/');
        await page.click('input.nav-search-input');
        await page.type('input.nav-search-input', produto);
        await page.click('div.nav-icon-search');
        await page.waitForSelector('ol.ui-search-layout.ui-search-layout--grid');
    }

    async function getItens(produto) {
        const cardData = await page.evaluate((produto) => {
            const cards = document.querySelectorAll('ol.ui-search-layout.ui-search-layout--grid li.ui-search-layout__item');
    
            return Array.from(cards).map(card => {
                const nome = card.querySelector('a.poly-component__title')?.textContent?.trim();
                const preco = card.querySelector('span.andes-money-amount.andes-money-amount--cents-superscript')?.textContent?.trim();
                const avaliacao = card.querySelector('span.poly-reviews__rating')?.textContent?.trim();
                const link = card.querySelector('a.poly-component__title')?.getAttribute('href');
    
                if (!avaliacao) {
                    return null;
                }
    
                return {
                    nome,
                    preco,
                    avaliacao,
                    link,
                    produto
                };
            }).filter(item => item !== null);
        }, produto);

        return cardData;
    }

    let allItens = []; 

    for (const produto of produtos) {
        console.log(`Procurando por: ${produto}`);
        await searchProduct(produto);  
        const itens = await getItens(produto);  
        allItens = allItens.concat(itens);  
    }

    console.log('Itens encontrados:', allItens);
    fs.writeFileSync('itens.json', JSON.stringify(allItens, null, 2));

    await browser.close();
})();
