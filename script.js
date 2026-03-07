const STORAGE_KEY = "registro_escolar_data";

const initialState = {
  years: [],
  students: []
};

let state = loadState();

const yearForm = document.getElementById("year-form");
const yearNameInput = document.getElementById("year-name");

const subjectForm = document.getElementById("subject-form");
const subjectYearSelect = document.getElementById("subject-year");
const subjectNameInput = document.getElementById("subject-name");

const studentForm = document.getElementById("student-form");
const studentNameInput = document.getElementById("student-name");
const studentYearSelect = document.getElementById("student-year");
const studentSubjectSelect = document.getElementById("student-subject");

const studentsTableBody = document.getElementById("students-table-body");
const emptyState = document.getElementById("empty-state");
const clearDataButton = document.getElementById("clear-data");

init();

function init() {
  bindEvents();
  renderAll();
}

function bindEvents() {
  yearForm.addEventListener("submit", onAddYear);
  subjectForm.addEventListener("submit", onAddSubject);
  studentForm.addEventListener("submit", onAddStudent);

  studentYearSelect.addEventListener("change", renderStudentSubjectsBySelectedYear);

  clearDataButton.addEventListener("click", () => {
    if (confirm("¿Seguro que deseas borrar toda la información guardada?")) {
      state = structuredClone(initialState);
      saveState();
      renderAll();
    }
  });
}

function onAddYear(event) {
  event.preventDefault();

  const name = yearNameInput.value.trim();

  if (!name) {
    return;
  }

  const duplicated = state.years.some((year) => year.name.toLowerCase() === name.toLowerCase());

  if (duplicated) {
    alert("Ese año escolar ya existe.");
    return;
  }

  const newYear = {
    id: createId(),
    name,
    subjects: []
  };

  state.years.push(newYear);
  saveState();
  yearForm.reset();
  renderAll();
}

function onAddSubject(event) {
  event.preventDefault();

  const yearId = subjectYearSelect.value;
  const subjectName = subjectNameInput.value.trim();

  if (!yearId || !subjectName) {
    return;
  }

  const year = state.years.find((item) => item.id === yearId);

  if (!year) {
    alert("Debes elegir un año válido.");
    return;
  }

  const duplicated = year.subjects.some(
    (subject) => subject.name.toLowerCase() === subjectName.toLowerCase()
  );

  if (duplicated) {
    alert("Esa materia ya existe en el año escolar seleccionado.");
    return;
  }

  year.subjects.push({
    id: createId(),
    name: subjectName
  });

  saveState();
  subjectForm.reset();
  renderAll();
}

function onAddStudent(event) {
  event.preventDefault();

  const studentName = studentNameInput.value.trim();
  const yearId = studentYearSelect.value;
  const subjectId = studentSubjectSelect.value;

  if (!studentName || !yearId || !subjectId) {
    return;
  }

  const year = state.years.find((item) => item.id === yearId);
  const subject = year?.subjects.find((item) => item.id === subjectId);

  if (!year || !subject) {
    alert("Debes seleccionar un año y una materia válidos.");
    return;
  }

  state.students.push({
    id: createId(),
    name: studentName,
    yearId,
    subjectId
  });

  saveState();
  studentForm.reset();
  studentYearSelect.value = yearId;
  renderAll();
}

function renderAll() {
  renderYearOptions();
  renderStudentSubjectsBySelectedYear();
  renderStudentsTable();
}

function renderYearOptions() {
  const yearOptions = state.years
    .map((year) => `<option value="${year.id}">${year.name}</option>`)
    .join("");

  if (state.years.length === 0) {
    subjectYearSelect.innerHTML = '<option value="">Primero crea un año escolar</option>';
    studentYearSelect.innerHTML = '<option value="">Primero crea un año escolar</option>';
    subjectYearSelect.disabled = true;
    studentYearSelect.disabled = true;
    studentSubjectSelect.innerHTML = '<option value="">Sin materias</option>';
    studentSubjectSelect.disabled = true;
    return;
  }

  subjectYearSelect.disabled = false;
  studentYearSelect.disabled = false;

  const selectedSubjectYear = subjectYearSelect.value;
  const selectedStudentYear = studentYearSelect.value;

  subjectYearSelect.innerHTML = yearOptions;
  studentYearSelect.innerHTML = yearOptions;

  if (state.years.some((year) => year.id === selectedSubjectYear)) {
    subjectYearSelect.value = selectedSubjectYear;
  }

  if (state.years.some((year) => year.id === selectedStudentYear)) {
    studentYearSelect.value = selectedStudentYear;
  }
}

function renderStudentSubjectsBySelectedYear() {
  const selectedYearId = studentYearSelect.value;
  const year = state.years.find((item) => item.id === selectedYearId);

  if (!year) {
    studentSubjectSelect.innerHTML = '<option value="">Sin materias</option>';
    studentSubjectSelect.disabled = true;
    return;
  }

  if (year.subjects.length === 0) {
    studentSubjectSelect.innerHTML = '<option value="">No hay materias en este año</option>';
    studentSubjectSelect.disabled = true;
    return;
  }

  studentSubjectSelect.disabled = false;
  studentSubjectSelect.innerHTML = year.subjects
    .map((subject) => `<option value="${subject.id}">${subject.name}</option>`)
    .join("");
}

function renderStudentsTable() {
  if (state.students.length === 0) {
    studentsTableBody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  studentsTableBody.innerHTML = state.students
    .map((student) => {
      const year = state.years.find((item) => item.id === student.yearId);
      const subject = year?.subjects.find((item) => item.id === student.subjectId);

      return `
      <tr>
        <td>${escapeHtml(student.name)}</td>
        <td>${escapeHtml(year?.name ?? "No disponible")}</td>
        <td>${escapeHtml(subject?.name ?? "No disponible")}</td>
      </tr>`;
    })
    .join("");
}

function loadState() {
  const rawData = localStorage.getItem(STORAGE_KEY);

  if (!rawData) {
    return structuredClone(initialState);
  }

  try {
    const parsed = JSON.parse(rawData);

    if (!parsed.years || !parsed.students) {
      return structuredClone(initialState);
    }

    return parsed;
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId() {
  return crypto.randomUUID();
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
