const fs = require('fs');
const readline = require('readline');

async function processCSV() {
    const fileStream = fs.createReadStream('/Users/derekcolling/Documents/Antigravity/revel/dance-schedule.csv');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const dances = {};
    let isFirstLine = true;
    let headers = [];

    for await (const line of rl) {
        if (line.trim() === 'dance') continue; // Skip title line

        if (isFirstLine) {
            // Day,Time,Dance Number,Category,Routine Title,Studio
            headers = line.split(',');
            isFirstLine = false;
            continue;
        }

        // Handle potential commas within quotes (basic CSV parsing)
        // For this specific clean CSV, a simple split might work, but let's be safe
        // Since it's clean and doesn't seem to have quotes based on the preview, simple split is fine.
        const parts = line.split(',');
        if (parts.length < 6) continue;

        const [day, time, danceNumber, category, routineTitle, studio] = parts;

        if (!danceNumber) continue;

        dances[danceNumber] = {
            day: day.trim(),
            time: time.trim(),
            category: category.trim(),
            routine_title: routineTitle.trim(),
            studio: studio.trim()
        };
    }

    const finalObject = {
        competitionInfo: {
            name: "Revel Dance Competition",
            status: "running",
            currentDance: "1"
        },
        dances: dances
    };

    fs.writeFileSync(
        '/Users/derekcolling/Documents/Antigravity/revel/schedule-optimized.json',
        JSON.stringify(finalObject, null, 2)
    );

    console.log("Successfully converted CSV to schedule-optimized.json");
}

processCSV();
