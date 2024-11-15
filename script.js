const spreadsheetId = '1QYGF_esetbXCsp6MGJ0O0JKulOidUY_OEsk5hidbfX0';
const apiKey = 'AIzaSyAsdBjMsZGM-NJ0g1N9DotI9NVJ37Ok4FA';
const range = 'Sheet1!A1:I';

async function fetchData() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`);
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error('Помилка:', error);
    }
}

window.onload = async () => {
    const data = await fetchData();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    populateFaculties(data);
    populateGroups(data);

    document.getElementById('search').onclick = () => {
        const faculty = document.getElementById('faculty').value;
        const course = document.getElementById('course').value;
        const group = document.getElementById('group').value;
        const date = document.getElementById('date').value;
        const week = document.getElementById('week').checked;

        let filteredData = filterByFacultyCourseGroup(data, faculty, course, group);
        if (week) {
            filteredData = filterByWeek(filteredData, date);
        } else {
            filteredData = filterByDate(filteredData, date);
        }

        displayData(filteredData, 'data');
    };
};

// Populate faculties dropdown
function populateFaculties(data) {
    const facultySelect = document.getElementById('faculty');
    const faculties = [...new Set(data.map(row => row[8]))]; // факультет в останньому стовпці
    faculties.forEach(faculty => {
        const option = document.createElement('option');
        option.value = faculty;
        option.textContent = faculty;
        facultySelect.appendChild(option);
    });

    facultySelect.addEventListener('change', () => {
        populateGroups(data);
    });
}

// Populate groups based on faculty and course
function populateGroups(data) {
    const groupSelect = document.getElementById('group');
    groupSelect.innerHTML = '';

    const faculty = document.getElementById('faculty').value;
    const course = document.getElementById('course').value;

    const groups = [...new Set(data.filter(row => row[8] === faculty && row[7] === course).map(row => row[1]))];
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupSelect.appendChild(option);
    });
}

// Filter data based on faculty, course, and group
function filterByFacultyCourseGroup(data, faculty, course, group) {
    return data.filter(row => row[8] === faculty && row[7] === course && row[1] === group);
}

// Filter data by date
function filterByDate(data, date) {
    const dateParts = date.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    return data.filter(row => row[0] === formattedDate);
}

// Filter data by week
function filterByWeek(data, date) {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return data.filter(row => {
        const [day, month, year] = row[0].split('.');
        const rowDate = new Date(`${year}-${month}-${day}`);
        return rowDate >= startDate && rowDate <= endDate;
    });
}

// Group rows by date
function groupByDate(rows) {
    return rows.reduce((acc, row) => {
        const date = row[0]; // Перша ячейка - дата
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(row);
        return acc;
    }, {});
}

// Display filtered data in a table
function displayData(rows, containerId) {
    const dataDiv = document.getElementById(containerId);
    dataDiv.innerHTML = '';

    if (rows.length > 0) {
        const headers = ['Дата', 'Група', 'Пара', 'Предмет', 'Викладач', 'Кабінет', 'Курс', 'Факультет'];

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        const groupedByDate = groupByDate(rows);

        Object.keys(groupedByDate).forEach(date => {
            const dateRow = document.createElement('tr');
            const dateCell = document.createElement('td');
            dateCell.colSpan = headers.length;
            dateCell.textContent = `Розклад на ${date}`;
            dateCell.style.textAlign = 'center';
            dateCell.style.fontWeight = 'bold';
            dateRow.appendChild(dateCell);
            tbody.appendChild(dateRow);

            groupedByDate[date].forEach(row => {
                const filteredRow = row.filter((_, index) => index !== 4); // Убираем елемент з індексом 4
                const tr = document.createElement('tr');
                filteredRow.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        });

        table.appendChild(tbody);
        dataDiv.appendChild(table);
    } else {
        dataDiv.textContent = 'Немає данних для відображення';
    }
}
document.getElementById('to-teacher-page').addEventListener('click', () => {
    // Укажите URL страницы с расписанием групп
    window.location.href = 'teacher.html';
});
document.getElementById('to-main-page').addEventListener('click', () => {
    // Укажите URL страницы с расписанием групп
    window.location.href = 'index.html';
});