const puppeteer = require('puppeteer');
const { getItens } = require('./getProduct');
const { getWrapperItens } = require('./getProductWrapper');
const fs = require('fs');

(async () => {
    const produto = process.argv[2];
    if (!produto) {
        console.error('Erro: Nenhum produto informado.');
        process.exit(1);
    }

    let validation;
    let searchPage;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    async function searchProduct(produto) {
        await page.goto('https://www.mercadolivre.com.br/');
        await page.click('input.nav-search-input');
        await page.type('input.nav-search-input', produto);
        await page.click('div.nav-icon-search');

        if (await page.waitForSelector('ol.ui-search-layout.ui-search-layout--grid', { timeout: 5000 } ).catch(() => null)) {
            validation = true;
            searchPage = 'ol.ui-search-layout.ui-search-layout--grid';
            console.log("Sem wrapper");
        } else if (await page.waitForSelector('ol.ui-search-layout.ui-search-layout--stack.shops__layout')) {
            validation = false;
            searchPage = 'ol.ui-search-layout.ui-search-layout--stack.shops__layout';
            console.log("Com wrapper");
        } else {
            console.log('Elemento não encontrado');
        }
    }

    async function scrollPage() {
        const timeout = 20000;
        const distance = 1000;
        const delay = 1000;

        await page.waitForSelector(searchPage, { timeout });

        await page.evaluate(async (distance, delay, timeout) => {
            const totalHeight = document.body.scrollHeight;

            const scrollPromise = new Promise(async (resolve) => {
                const startTime = Date.now();
                while (document.documentElement.scrollTop + window.innerHeight < totalHeight) {
                    if (Date.now() - startTime > timeout) {
                        return resolve('Tempo de scroll excedido!');
                    }
                    window.scrollBy(0, distance);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                resolve();
            });

            await scrollPromise;
        }, distance, delay, timeout);
    }

    console.log(`Procurando por: ${produto}`);
    await searchProduct(produto);
    await scrollPage();

    // Chamar as funções de acordo com a validação
    let itens;
    if (validation) {
        console.log('Entrou sem wrapper')
        itens = await getItens(produto, page);
    } else {
        console.log("Entrou wrapper")
        itens = await getWrapperItens(produto, page);
    }

    console.log('Itens encontrados:', itens);
    fs.writeFileSync('itens.json', JSON.stringify(itens, null, 2));

    await browser.close();
})();
