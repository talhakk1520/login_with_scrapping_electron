const { Builder, By} = require('selenium-webdriver');
const  { getConnection } = require('../database');

const showText = document.querySelector("#showText");
const formContainer = document.querySelector("#formContainer");

async function vendors(){
    try {
        const conn = await getConnection();
        const vendors = await conn.query("SELECT * FROM vendors");

        vendors.forEach(vendor => {
            const vendorCard = document.createElement('div');
            vendorCard.className = 'card card-body mt-3';

            const vendorTitle = document.createElement('h5');
            vendorTitle.innerText = `Vendor: ${vendor.vendor_name}`;
            vendorCard.appendChild(vendorTitle);

            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.innerText = `Login to ${vendor.vendor_name}`;

            button.addEventListener("click", async() => {
                showText.innerText = `Starting login process for ${vendor.vendor_name}`;
                try {
                    const vendorDetails = await conn.query("SELECT * FROM vendors WHERE id = ?", [vendor.id]);
                    const { link, email, password } = vendorDetails[0];

                    // console.log(`Logging into ${vendor.vendor_name}:`, { link, email, password });

                    const driver = await new Builder().forBrowser('chrome').build();

                    await driver.manage().window().maximize();

                    await driver.get(link);

                    await driver.findElement(By.id('email')).sendKeys(email);
                    await driver.findElement(By.id('password')).sendKeys(password);

                    const loginButton = await driver.findElement(By.xpath(
                        "//button[@type='submit' and contains(@class, 'btn-primary')]"
                    ));

                    await loginButton.click();

                    showText.innerText = `Successfully logged into ${vendor.vendor_name}.`;
                } catch (error) {
                    console.error(error);
                    showText.innerText = `Error logging into ${vendor.vendor_name}: ${error.message}`;
                }
            });

            vendorCard.appendChild(button);
            formContainer.appendChild(vendorCard);
        });
    } catch (error) {
        console.error(error);
        showText.innerText = `Error initializing vendors: ${error.message}`;
    }
}

vendors();
