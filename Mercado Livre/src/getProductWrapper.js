async function getWrapperItens(produto, page) {
    const cardData = await page.evaluate((produto) => {
        console.log('passo aqui');
        const cards = document.querySelectorAll('ol.ui-search-layout.ui-search-layout--stack.shops__layout li.ui-search-layout__item.shops__layout-item');
        
        return Array.from(cards).map(card => {
            const nome = card.querySelector('a.poly-component__title')?.textContent?.trim();
            const preco = card.querySelector('span.andes-money-amount.andes-money-amount--cents-superscript')?.textContent?.trim();
            const avaliacao = card.querySelector('span.poly-reviews__rating')?.textContent?.trim();
            const link = card.querySelector('a.poly-component__title')?.getAttribute('href');
            const image = card.querySelector('img[src]')?.getAttribute('src')?.trim();

            return {
                nome,
                preco,
                avaliacao: avaliacao || 'Sem avaliação', 
                link,
                produto,
                image
            };
        }).filter(item => item !== null);
    }, produto);

    return cardData;
}

module.exports = { getWrapperItens };