const { Builder, By} = require('selenium-webdriver');
const  { getConnection } = require('../database');
const chrome = require('selenium-webdriver/chrome');
const { exec } = require('child_process');
const fs = require('fs');

const showText = document.querySelector("#showText");
const formContainer = document.querySelector("#formContainer");

async function loginAndPost(vendorDetails) {
    try {
        const { link, email, password } = vendorDetails[0];

        const options = new chrome.Options();
        options.addArguments('--headless', '--disable-gpu', '--window-size=1920,1080');

         const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        // console.log(`Logging into ${vendor.vendor_name}:`, { link, email, password });

        // const driver = await new Builder().forBrowser('chrome').build();

        // await driver.manage().window().maximize();

        await driver.get(link);

        await driver.findElement(By.id('email')).sendKeys(email);
            await driver.findElement(By.id('password')).sendKeys(password);

        const loginButton = await driver.findElement(By.xpath(
            "//button[@type='submit' and contains(@class, 'btn-primary')]"
        ));

        await loginButton.click();

        const postLoginPage = await driver.getCurrentUrl();

        console.log(postLoginPage);

        // const cookiesFile = `cookies_${vendorDetails[0].id}.json`;
        const cookies = await driver.manage().getCookies();

        console.log(cookies);
        // fs.writeFileSync(cookiesFile, JSON.stringify(cookies));

        // driver.quit();

        const postLoginDriver = await new Builder().forBrowser('chrome').build();
        // await postLoginDriver.manage().addCookie(cookies);

        await postLoginDriver.get(link); 
        for (let cookie of cookies) {
            await postLoginDriver.manage().addCookie(cookie);
        }

        await postLoginDriver.get(postLoginPage);

        // exec(`start chrome ${postLoginPage}`);
    } catch (error) {
        console.log(error);
        showText.innerText = `Error: ${error.message}`;
    }
}

async function vendors(){
    try {
        const conn = await getConnection();
        const vendors = await conn.query("SELECT * FROM vendors");

        vendors.forEach(vendor => {
            const vendorCard = document.createElement('div');
            vendorCard.className = 'card card-body mt-3';

            const vendorTitle = document.createElement('h5');
            vendorTitle.innerText = vendor.vendor_name;
            vendorCard.appendChild(vendorTitle);

            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.innerText = `Login to ${vendor.vendor_name}`;

            button.addEventListener("click", async() => {
                showText.innerText = `Starting login process for ${vendor.vendor_name}`;
                try {
                    const vendorDetails = await conn.query("SELECT * FROM vendors WHERE id = ?", [vendor.id]);
                    await loginAndPost(vendorDetails);

                    showText.innerText = `Successfully logged into ${vendor.vendor_name}.`;
                } catch (error) {
                    console.log(error);
                    showText.innerText = `Error logging into ${vendor.vendor_name}: ${error.message}`;
                }
            });

            vendorCard.appendChild(button);
            formContainer.appendChild(vendorCard);
        });
    } catch (error) {
        console.log(error);
        showText.innerText = `Error: ${error.message}`;
    }
}

vendors();
