
import fs from "fs";
import validator from "validator";
import chalk from "chalk";
import url from "url";

let path = process.argv[2];
const blockedFilePath = './block-url.txt';
const outputFilePath = './enteredValidateURL.txt';
const paramsFilePath = './urlParameters.json'; 

if (path == undefined) {
    console.log(chalk.red("Please Enter a Path"));
    process.exit(1);
}

if (validator.isURL(path)) {
    try {
        const blockedURLs = fs.existsSync(blockedFilePath) 
            ? fs.readFileSync(blockedFilePath, 'utf-8').split('\n').map(url => url.trim()).filter(url => url !== '')
            : [];

        if (blockedURLs.some(blockedURL => blockedURL === path)) {
            console.log(chalk.red("Access Denied! This URL is blocked."));
            process.exit(1);
        }
    } catch (error) {
        console.error(chalk.red("Error reading blocked URLs file:"), error.message);
        process.exit(1);
    }

    console.log(chalk.green("Valid URL:"), chalk.blueBright(`${path}`));
    
    let uri = url.parse(path, true);
    console.log(chalk.green("Host:"), chalk.blueBright(uri.host));

    const queryParams = uri.query;
    if (Object.keys(queryParams).length > 0) {
        console.log(chalk.green("Extracted Parameters:"), queryParams);

        try {
            const existingParams = fs.existsSync(paramsFilePath) 
                ? JSON.parse(fs.readFileSync(paramsFilePath, 'utf-8'))
                : {};

            const updatedParams = { ...existingParams, [path]: queryParams };

            fs.writeFileSync(paramsFilePath, JSON.stringify(updatedParams, null, 2));
            console.log(chalk.yellow(`Parameters have been saved to ${paramsFilePath}`));
        } catch (error) {
            console.error(chalk.red("Error writing parameters to JSON file:"), error.message);
        }
    } else {
        console.log(chalk.blue("No query parameters found in the URL."));
    }

    try {
        fs.appendFileSync(outputFilePath, `${path}\n`);
        console.log(chalk.yellow(`URL has been saved to ${outputFilePath}`));
    } catch (error) {
        console.error(chalk.red("Error writing to file:"), error.message);
    }
} else {
    console.log(chalk.red("The provided path is not a valid URL."));
}
