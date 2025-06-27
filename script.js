// GET запрос для получения данных сотрудника
async function fetchEmployeeData() {
  try {
    const response = await fetch("https://learn-9fc9-git-main-imsokolovivs-projects.vercel.app/api/adaptation/test", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    throw error;
  }
}

// Функция для обновления имени в NavBar
function updateNavBarName(employee) {
  const userNameElement = document.querySelector(".user-name");
  if (userNameElement) {
    userNameElement.textContent = `${employee.firstName} ${employee.secondName}`;
  }
}

// Функция для заполнения страницы данными сотрудника
function populateEmployeePage(employeeData) {
  const { employee, mentors, helpContacts } = employeeData;

  // Заполняем имя сотрудника
  const nameElement = document.querySelector(".employee-name");
  nameElement.textContent = `${employee.firstName} ${employee.secondName.charAt(0)}.`;

  // Заполняем детали сотрудника
  const detailElements = document.querySelectorAll(".detail-item");

  // Юрлицо
  const organizationElement = detailElements[0]?.querySelector(".detail-value");
  if (organizationElement) {
    organizationElement.textContent = employee.organization;
  }

  // Подразделение (используем department)
  const departmentElement = detailElements[1]?.querySelector(".detail-value");
  if (departmentElement) {
    departmentElement.textContent = employee.department;
  }

  // Отдел/команда (можно оставить пустым или использовать department)
  const teamElement = detailElements[2]?.querySelector(".detail-value");
  if (teamElement) {
    teamElement.textContent = employee.department; // или оставить пустым
  }

  // Должность
  const positionElement = detailElements[3]?.querySelector(".detail-value");
  if (positionElement) {
    positionElement.textContent = employee.position;
  }

  // Место работы
  const officeElement = detailElements[5]?.querySelector(".detail-value");
  if (officeElement) {
    officeElement.textContent = employee.officeAddress;
  }

  // Заполняем секцию "О себе"
  const aboutElement = document.querySelector(".section-content");
  if (aboutElement && employee.about) {
    aboutElement.textContent = employee.about;
  }

  // Обновляем имя в NavBar
  updateNavBarName(employee);
}

async function updateDocumentsVisibility() {
  try {
    const { documents } = await fetchEmployeeData();

    // Приводим документы к нижнему регистру и убираем лишние символы
    const normalizedDocs = documents.map((doc) => doc.toLowerCase().replace(/\s+/g, " ").trim());

    // Перебираем все элементы документа
    const docItems = document.querySelectorAll("#docs .detail-item-p2");

    docItems.forEach((item) => {
      const labelEl = item.querySelector(".detail-label-p2");
      if (!labelEl) return;

      const labelText = labelEl.textContent.toLowerCase().replace(/\s+/g, " ").trim();

      // Ищем документ, который содержит этот заголовок
      const isVisible = normalizedDocs.some((doc) => labelText.includes(doc) || doc.includes(labelText));

      if (!isVisible) {
        item.style.display = "none";
      }
    });
  } catch (error) {
    console.error("Ошибка при обновлении списка документов:", error);
  }
}

function populateMentors(mentors = []) {
  const mentorBlocks = document.querySelectorAll(".mentor-block");
  if (!mentorBlocks.length) return;

  mentors.forEach((mentor, index) => {
    const block = mentorBlocks[index];
    if (!block) return;

    const nameEl = block.querySelector(".spec-block-title");
    const positionEl = block.querySelector(".spec-block-job");
    const roleEl = block.querySelector(".spec-block-description");

    if (nameEl) nameEl.textContent = mentor.fullName || "Имя не указано";
    if (positionEl) positionEl.textContent = mentor.position || "Должность не указана";
    if (roleEl) roleEl.textContent = mentor.role || "Роль не указана";

    const icons = block.querySelectorAll(".spec-block-icon");

    const iconData = [
      { value: mentor.officeAddress },
      { value: mentor.email },
      { value: mentor.phone },
      { value: mentor.telegram },
      { value: mentor.mattermost },
    ];

    icons.forEach((icon, i) => {
      // Удаляем старый текст, если есть
      const oldText = icon.querySelector(".mentor-icon-tooltip");
      if (oldText) oldText.remove();

      // Создаём новый элемент с данными
      const tooltip = document.createElement("div");
      tooltip.classList.add("mentor-icon-tooltip");
      tooltip.textContent = iconData[i]?.value || "Нет данных";

      icon.appendChild(tooltip);
    });

    block.style.display = "";
  });

  // Скрыть лишние блоки
  for (let i = mentors.length; i < mentorBlocks.length; i++) {
    mentorBlocks[i].style.display = "none";
  }
}

// Основная функция для загрузки и заполнения данных
async function loadAndPopulateEmployeeData() {
  try {
    console.log("Загружаем данные сотрудника...");

    const employeeData = await fetchEmployeeData();

    populateEmployeePage(employeeData); // Заполняем страницу
    populateMentors(employeeData.mentors); // Заполняем данные о наставнике
    updateDocumentsVisibility(employeeData.documents); // Обновляем отображение документов

    console.log("Данные сотрудника успешно загружены и отображены");
  } catch (error) {
    console.error("Ошибка при загрузке данных сотрудника:", error);

    const nameElement = document.querySelector(".employee-name");
    if (nameElement) {
      nameElement.textContent = "Ошибка загрузки данных";
    }
  }
}

// Обновлённая функция фильтрации документов
function updateDocumentsVisibility(documents) {
  const normalizedDocs = documents.map((doc) => doc.toLowerCase().replace(/\s+/g, " ").trim());

  const docItems = document.querySelectorAll("#docs .detail-item-p2");

  docItems.forEach((item) => {
    const labelEl = item.querySelector(".detail-label-p2");
    if (!labelEl) return;

    const labelText = labelEl.textContent.toLowerCase().replace(/\s+/g, " ").trim();

    const isVisible = normalizedDocs.some((doc) => labelText.includes(doc) || doc.includes(labelText));

    if (!isVisible) {
      item.style.display = "none";
    }
  });
}

// Запускаем загрузку данных после загрузки DOM
document.addEventListener("DOMContentLoaded", loadAndPopulateEmployeeData);
