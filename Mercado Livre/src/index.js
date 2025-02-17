const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const produto = process.argv[2];
    if (!produto) {
        console.error('Erro: Nenhum produto informado.');
        process.exit(1);
    }

    const browser = await puppeteer.launch({ headless: true });
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
                const image = card.querySelector('img[src]')?.getAttribute('src')?.trim();
    
                return {
                    nome,
                    preco,
                    avaliacao: avaliacao || 'Sem avaliação', // Se não houver avaliação, coloca um valor padrão
                    link,
                    produto,
                    image
                };
            }).filter(item => item !== null);
        }, produto);

        return cardData;
    }

    // Função para rolar a página
    async function scrollPage() {
        await page.evaluate(async () => {
            const distance = 1000; // Distância do scroll em pixels
            const delay = 1000; // Intervalo entre os scrolls em milissegundos
            const totalHeight = document.body.scrollHeight;

            while (document.documentElement.scrollTop + window.innerHeight < totalHeight) {
                window.scrollBy(0, distance);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        });
    }

    console.log(`Procurando por: ${produto}`);
    await searchProduct(produto);
    await scrollPage();  
    const itens = await getItens(produto);

    console.log('Itens encontrados:', itens);
    fs.writeFileSync('itens.json', JSON.stringify(itens, null, 2));

    await browser.close();
})();
