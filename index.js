const fs = require('fs');
const csv = require('csv-parser');

function analyzeCsv(filePath) {
    const results = {
        consecutiveDaysEmployees: new Set(),
        lessThan10HoursEmployees: new Set(),
        moreThan14HoursEmployees: new Set()
    };

    let currentName = null;
    let consecutiveDays = 0;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            const { Time, 'Timecard Hours (as Time)': TimecardHours, 'Employee Name': EmployeeName } = row;

            if (currentName !== EmployeeName) {
                // New employee, reset counters
                currentName = EmployeeName;
                consecutiveDays = 0;
            }

            // Check condition a) who has worked for 7 consecutive days.
            consecutiveDays++;
            if (consecutiveDays === 7) {
                results.consecutiveDaysEmployees.add(EmployeeName);
            }

            // Check condition b) who have less than 10 hours of time between shifts but greater than 1 hour
            if (parseFloat(TimecardHours) > 1 && parseFloat(TimecardHours) < 10) {
                results.lessThan10HoursEmployees.add(EmployeeName);
            }

            // Check condition c) Who has worked for more than 14 hours in a single shift
            if (parseFloat(TimecardHours) > 14) {
                results.moreThan14HoursEmployees.add(EmployeeName);
            }
        })
        .on('end', () => {
            // Display the results
            console.log("Analysis Results:");
            console.log("Employees who have worked for 7 consecutive days:", Array.from(results.consecutiveDaysEmployees).join(', '));
            console.log("Employees who have less than 10 hours of time between shifts but greater than 1 hour:", Array.from(results.lessThan10HoursEmployees).join(', '));
            console.log("Employees who have worked for more than 14 hours in a single shift:", Array.from(results.moreThan14HoursEmployees).join(', '));
        });
}

// Replace 'path/to/your/file.csv' with the actual path to your CSV file
const filePath = './data.csv';
analyzeCsv(filePath);
