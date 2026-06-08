const leadForm = document.getElementById("leadForm");
const feedback = document.getElementById("leadFeedback");

function setLeadFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `lead-feedback ${type || ""}`;
}

function validateLead(form) {
  const requiredFields = Array.from(form.querySelectorAll("[required]"));
  const emptyField = requiredFields.find((field) => !String(field.value).trim());

  if (emptyField) {
    emptyField.focus();
    return "Preencha todos os campos obrigatorios para solicitar o atendimento.";
  }

  const email = document.getElementById("leadEmail");
  if (!email.validity.valid) {
    email.focus();
    return "Informe um e-mail valido para retorno da equipe.";
  }

  return "";
}

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const validationMessage = validateLead(leadForm);
  if (validationMessage) {
    setLeadFeedback(validationMessage, "error");
    return;
  }

  const formData = new FormData(leadForm);
  const lead = {
    name: formData.get("name").trim(),
    phone: formData.get("phone").trim(),
    email: formData.get("email").trim(),
    address: formData.get("address").trim(),
    interest: formData.get("interest"),
    message: formData.get("message").trim(),
    createdAt: new Date().toISOString()
  };

  const storedLeads = JSON.parse(localStorage.getItem("alfaiatariaLeads") || "[]");
  storedLeads.push(lead);
  localStorage.setItem("alfaiatariaLeads", JSON.stringify(storedLeads));

  leadForm.reset();
  setLeadFeedback("Solicitacao enviada. A equipe VIP entrara em contato para agendar a visita.", "success");
});
