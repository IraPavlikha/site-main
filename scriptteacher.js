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
    populateTeachers(data);

    document.getElementById('search-teacher').onclick = () => {
        const teacher = document.getElementById('teacher').value;
        const date = document.getElementById('teacher-date').value;
        const filteredData = filterByTeacherAndDate(data, teacher, date);
        displayData(filteredData, 'teacher-data');
    };

    setTodayDate();
};

// Заповнення списку викладачів
function populateTeachers(data) {
    const teacherInput = document.getElementById('teacher');
    const teacherDatalist = document.getElementById('teachers');
    teacherDatalist.innerHTML = '';

    const teachers = [...new Set(data.map(row => row[5]))]; // Викладач у стовпці 5 (F)
    teachers.forEach(teacher => {
        if (teacher) { // Перевіряємо, чи не пусте значення
            const option = document.createElement('option');
            option.value = teacher;
            teacherDatalist.appendChild(option);
        }
    });

    // Додавання функції автозаповнення
    teacherInput.addEventListener('input', () => {
        const value = teacherInput.value.toLowerCase();
        const filteredTeachers = teachers.filter(teacher => teacher.toLowerCase().includes(value));
        teacherDatalist.innerHTML = '';
        filteredTeachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher;
            teacherDatalist.appendChild(option);
        });
    });
}

// Фільтрація за викладачем і датою
function filterByTeacherAndDate(data, teacher, date) {
    const dateParts = date.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    return data.filter(row => row[5] === teacher && row[0] === formattedDate); // Викладач у стовпці 5, дата у стовпці 0
}

// Функція для встановлення сьогоднішньої дати
function setTodayDate() {
    const dateInput = document.getElementById('teacher-date');
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD формат
    dateInput.value = formattedDate;
}

// Функція для відображення таблиці
function displayData(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p class="no-data">Немає даних для відображення</p>';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Заголовки таблиці
    const headers = ['Дата', 'Група', 'Предмет', 'Курс', 'Аудиторія'];
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Дані таблиці
    data.forEach(row => {
        const tr = document.createElement('tr');
        const columns = [
            row[0], // Дата
            row[1], // Час
            row[3], // Група (стовпець D)
            row[4], // Предмет (стовпець E)
            row[6]  // Аудиторія (стовпець G)
        ];

        columns.forEach(value => {
            const td = document.createElement('td');
            td.textContent = value || '—';
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
}
document.getElementById('to-teacher-page').addEventListener('click', () => {
    // Укажите URL страницы с расписанием групп
    window.location.href = 'teacher.html';
});
document.getElementById('to-main-page').addEventListener('click', () => {
    // Укажите URL страницы с расписанием групп
    window.location.href = 'index.html';
});