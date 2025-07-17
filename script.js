let deferredPrompt;
let installButton;

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

  // Заполняем аватар
  const avatarElement = document.querySelector(".employee-avatar");
  if (employee.photo) {
    avatarElement.innerHTML = `<img src="${employee.photo}" alt="Фото ${employee.firstName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">`;
  }

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

  // Email

  const emailElement = detailElements[4]?.querySelector(".detail-value");
  if (emailElement) {
    emailElement.textContent = employee.email;
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

// Заполнение документов

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

//Заполнение наставников

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

// Заполнение помощи сотруднику

function populateHelpContacts(helpContacts) {
  const contactSections = document.querySelectorAll("#help .spec-block");

  contactSections.forEach((section, index) => {
    const contact = helpContacts[index];

    if (!contact) {
      section.style.display = "none";
      return;
    }

    // Заголовок-блок (описание роли)
    const description = section.querySelector(".spec-block-description");
    if (description) description.textContent = contact.role;

    // Имя
    const fullName = section.querySelector(".spec-block-title");
    if (fullName) fullName.textContent = contact.fullName;

    // Должность
    const position = section.querySelector(".spec-block-job");
    if (position) position.textContent = contact.position;

    // Удалим все старые вопросы
    const oldQuestions = section.querySelectorAll("li.spec-block-text");
    oldQuestions.forEach((q) => q.remove());

    // Если есть вопросы — вставим их
    if (contact.questions && contact.questions.length > 0) {
      const textIntro = section.querySelector("p.spec-block-text");
      if (textIntro) textIntro.style.display = "block";
      contact.questions.forEach((question) => {
        const li = document.createElement("li");
        li.className = "spec-block-text";
        li.textContent = question;
        textIntro.parentNode.insertBefore(li, section.querySelector(".spec-block-icons-block"));
      });
    } else {
      const textIntro = section.querySelector("p.spec-block-text");
      if (textIntro) textIntro.style.display = "none";
    }

    // Контакты в иконках (по ховеру, как раньше)
    const iconBlocks = section.querySelectorAll(".spec-block-icon");
    const contactValues = [
      contact.officeAddress || "",
      contact.email || "",
      contact.phone || "",
      contact.telegram || "",
      (contact.fullName.match(/\b\w/g) || []).join("").toUpperCase(), // MT
    ];

    iconBlocks.forEach((icon, i) => {
      const span = document.createElement("span");
      span.textContent = contactValues[i];
      span.classList.add("icon-tooltip");
      icon.appendChild(span);
    });
  });
}

// Основная функция для загрузки и заполнения данных
async function loadAndPopulateEmployeeData() {
  try {
    console.log("Загружаем данные сотрудника...");

    const employeeData = await fetchEmployeeData();

    populateEmployeePage(employeeData); // Заполняем страницу
    populateMentors(employeeData.mentors); // Заполняем данные о наставнике
    populateHelpContacts(employeeData.helpContacts); // Заполняем данные о помощи
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

// Регистрация Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register('/practice/sw.js')
      .then((registration) => {
        console.log("SW зарегистрирован: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW регистрация не удалась: ", registrationError);
      });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  // Получаем кнопку установки
  installButton = document.getElementById("install-button");

  // Изначально скрываем кнопку
  if (installButton) {
    installButton.style.display = "none";
  }
});

// Событие перед показом промпта установки
window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt сработал");

  // Предотвращаем автоматический показ промпта
  e.preventDefault();

  // Сохраняем событие для использования позже
  deferredPrompt = e;

  // Показываем кнопку установки
  if (installButton) {
    installButton.style.display = "block";
  }
});

// Обработчик клика на кнопку установки
function handleInstallClick() {
  if (deferredPrompt) {
    // Показываем промпт установки
    deferredPrompt.prompt();

    // Ждем ответа пользователя
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Пользователь принял установку");
      } else {
        console.log("Пользователь отклонил установку");
      }

      // Очищаем сохраненное событие
      deferredPrompt = null;

      // Скрываем кнопку
      if (installButton) {
        installButton.style.display = "none";
      }
    });
  }
}

// Событие после успешной установки
window.addEventListener("appinstalled", (evt) => {
  console.log("PWA успешно установлено");

  // Скрываем кнопку установки
  if (installButton) {
    installButton.style.display = "none";
  }
});

<script>
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
</script>


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
