let deferredPrompt;
let installButton;

// Получение данных сотрудника
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

// Обновление имени в навбаре
function updateNavBarName(employee) {
  const userNameElement = document.querySelector(".user-name");
  if (userNameElement) {
    userNameElement.textContent = `${employee.firstName} ${employee.secondName}`;
  }
}

// Заполнение страницы данными
function populateEmployeePage(employeeData) {
  const { employee } = employeeData;

  const avatarElement = document.querySelector(".employee-avatar");
  if (employee.photo && avatarElement) {
    avatarElement.innerHTML = `<img src="${employee.photo}" alt="Фото ${employee.firstName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">`;
  }

  const nameElement = document.querySelector(".employee-name");
  if (nameElement) {
    nameElement.textContent = `${employee.firstName} ${employee.secondName.charAt(0)}.`;
  }

  const detailElements = document.querySelectorAll(".detail-item");

  const detailsMap = [
    employee.organization,
    employee.department,
    employee.department,
    employee.position,
    employee.email,
    employee.officeAddress,
  ];

  detailElements.forEach((el, i) => {
    const value = el?.querySelector(".detail-value");
    if (value && detailsMap[i]) {
      value.textContent = detailsMap[i];
    }
  });

  const aboutElement = document.querySelector(".section-content");
  if (aboutElement && employee.about) {
    aboutElement.textContent = employee.about;
  }

  updateNavBarName(employee);
}

// Отображение документов
function updateDocumentsVisibility(documents) {
  const normalizedDocs = documents.map((doc) => doc.toLowerCase().replace(/\s+/g, " ").trim());
  const docItems = document.querySelectorAll("#docs .detail-item-p2");

  docItems.forEach((item) => {
    const labelEl = item.querySelector(".detail-label-p2");
    if (!labelEl) return;

    const labelText = labelEl.textContent.toLowerCase().replace(/\s+/g, " ").trim();
    const isVisible = normalizedDocs.some((doc) => labelText.includes(doc) || doc.includes(labelText));

    item.style.display = isVisible ? "" : "none";
  });
}

// Заполнение наставников
function populateMentors(mentors = []) {
  const mentorBlocks = document.querySelectorAll(".mentor-block");
  if (!mentorBlocks.length) return;

  mentors.forEach((mentor, index) => {
    const block = mentorBlocks[index];
    if (!block) return;

    block.querySelector(".spec-block-title").textContent = mentor.fullName || "Имя не указано";
    block.querySelector(".spec-block-job").textContent = mentor.position || "Должность не указана";
    block.querySelector(".spec-block-description").textContent = mentor.role || "Роль не указана";

    const icons = block.querySelectorAll(".spec-block-icon");
    const iconData = [mentor.officeAddress, mentor.email, mentor.phone, mentor.telegram, mentor.mattermost];

    icons.forEach((icon, i) => {
      icon.querySelector(".mentor-icon-tooltip")?.remove();
      const tooltip = document.createElement("div");
      tooltip.classList.add("mentor-icon-tooltip");
      tooltip.textContent = iconData[i] || "Нет данных";
      icon.appendChild(tooltip);
    });

    block.style.display = "";
  });

  for (let i = mentors.length; i < mentorBlocks.length; i++) {
    mentorBlocks[i].style.display = "none";
  }
}

// Заполнение блока помощи
function populateHelpContacts(helpContacts) {
  const contactSections = document.querySelectorAll("#help .spec-block");

  contactSections.forEach((section, index) => {
    const contact = helpContacts[index];

    if (!contact) {
      section.style.display = "none";
      return;
    }

    section.querySelector(".spec-block-description").textContent = contact.role;
    section.querySelector(".spec-block-title").textContent = contact.fullName;
    section.querySelector(".spec-block-job").textContent = contact.position;

    const oldQuestions = section.querySelectorAll("li.spec-block-text");
    oldQuestions.forEach((q) => q.remove());

    const textIntro = section.querySelector("p.spec-block-text");

    if (contact.questions?.length > 0 && textIntro) {
      textIntro.style.display = "block";
      contact.questions.forEach((q) => {
        const li = document.createElement("li");
        li.className = "spec-block-text";
        li.textContent = q;
        textIntro.parentNode.insertBefore(li, section.querySelector(".spec-block-icons-block"));
      });
    } else if (textIntro) {
      textIntro.style.display = "none";
    }

    const icons = section.querySelectorAll(".spec-block-icon");
    const contactValues = [
      contact.officeAddress || "",
      contact.email || "",
      contact.phone || "",
      contact.telegram || "",
      (contact.fullName.match(/\b\w/g) || []).join("").toUpperCase(), // Инициалы
    ];

    icons.forEach((icon, i) => {
      const span = document.createElement("span");
      span.textContent = contactValues[i];
      span.classList.add("icon-tooltip");
      icon.appendChild(span);
    });
  });
}

// Основная функция
async function loadAndPopulateEmployeeData() {
  try {
    console.log("Загружаем данные сотрудника...");
    const employeeData = await fetchEmployeeData();

    populateEmployeePage(employeeData);
    populateMentors(employeeData.mentors);
    populateHelpContacts(employeeData.helpContacts);
    updateDocumentsVisibility(employeeData.documents);

    console.log("Данные сотрудника успешно загружены и отображены");
  } catch (error) {
    console.error("Ошибка при загрузке данных сотрудника:", error);
    const nameElement = document.querySelector(".employee-name");
    if (nameElement) {
      nameElement.textContent = "Ошибка загрузки данных";
    }
  }
}

// PWA: Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/practice/sw.js")
      .then((registration) => {
        console.log("SW зарегистрирован: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW регистрация не удалась: ", registrationError);
      });
  });
}

// PWA: Установка
window.addEventListener("DOMContentLoaded", () => {
  installButton = document.getElementById("install-button");
  if (installButton) installButton.style.display = "none";
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installButton) installButton.style.display = "block";
});

function handleInstallClick() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Пользователь принял установку");
      } else {
        console.log("Пользователь отклонил установку");
      }
      deferredPrompt = null;
      if (installButton) installButton.style.display = "none";
    });
  }
}

window.addEventListener("appinstalled", () => {
  console.log("PWA успешно установлено");
  if (installButton) installButton.style.display = "none";
});

// Мобильное меню
document.addEventListener("DOMContentLoaded", () => {
  loadAndPopulateEmployeeData();

  const toggleBtn = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");
  const menuLinks = document.querySelectorAll(".nav-menu a");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  if (sidebar) {
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("open");
        }
      });
    });
  }
});
