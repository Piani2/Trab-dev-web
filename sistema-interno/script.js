let state = {
  clients: [],
  measures: [],
  orders: [],
  query: ""
};

const API_URL = "http://localhost:3000/api";

const titles = {
  dashboard: "Painel de acompanhamento",
  clientes: "Gestão de clientes VIP",
  medidas: "Ficha de medidas",
  pedidos: "Pedidos de confecção"
};

async function fetchData() {
  try {
    const [clientsRes, measuresRes, ordersRes] = await Promise.all([
      fetch(`${API_URL}/clients`),
      fetch(`${API_URL}/measures`),
      fetch(`${API_URL}/orders`)
    ]);

    if (clientsRes.ok) state.clients = await clientsRes.json();
    if (measuresRes.ok) state.measures = await measuresRes.json();
    if (ordersRes.ok) state.orders = await ordersRes.json();

    renderAll();
  } catch (error) {
    console.error("Erro ao carregar dados da API:", error);
    alert("Falha na conexão com o servidor. Verifique se o backend está rodando.");
  }
}

function getClient(id) {
  return state.clients.find((client) => client.id === id);
}

function getMeasure(clientId) {
  return state.measures.find((measure) => measure.clientId === clientId);
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function formatDate(dateString) {
  if (!dateString) return "Não informado";
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("pt-BR");
}

function deadlineInfo(order) {
  const dueDate = order.dueDate || addDays(order.openedAt, 30);
  const limitDate = new Date(`${dueDate}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const remaining = Math.ceil((limitDate - today) / 86400000);

  return {
    remaining,
    label: remaining < 0 ? `${Math.abs(remaining)} dias atrasado` : `${remaining} dias restantes`,
    critical: remaining <= 7,
    dueDate
  };
}

function matchesQuery(client) {
  if (!client) return false;
  const query = state.query.trim().toLowerCase();
  if (!query) return true;
  return [client.name, client.email, client.phone, client.profession, client.address]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function setFeedback(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `feedback ${type || ""}`;
}

function renderMetrics() {
  const completeMeasures = state.clients.filter((client) => getMeasure(client.id)).length;
  const activeOrders = state.orders.filter((order) => order.status !== "Pronto para entrega").length;
  const criticalOrders = state.orders.filter((order) => deadlineInfo(order).critical).length;

  document.getElementById("metricClients").textContent = state.clients.filter((client) => client.active).length;
  document.getElementById("metricMeasures").textContent = completeMeasures;
  document.getElementById("metricOrders").textContent = activeOrders;
  document.getElementById("metricDeadlines").textContent = criticalOrders;
}

function renderOrdersTable() {
  const table = document.getElementById("ordersTable");
  table.innerHTML = state.orders.map((order) => {
    const client = getClient(order.clientId);
    if (!client) return "";
    const deadline = deadlineInfo(order);
    const statusClass = order.status === "Pronto para entrega" ? "done" : deadline.critical ? "alert" : "";

    return `
      <tr>
        <td>${client.name}</td>
        <td>${order.model}</td>
        <td>${order.fabric}</td>
        <td><span class="status-pill ${statusClass}">${order.status}</span></td>
        <td>${deadline.label}</td>
      </tr>
    `;
  }).join("");
}

function renderClients() {
  const list = document.getElementById("clientList");
  const clients = state.clients.filter(matchesQuery);

  if (!clients.length) {
    list.innerHTML = '<div class="empty-state">Nenhum cliente encontrado para a busca atual.</div>';
    return;
  }

  list.innerHTML = clients.map((client) => {
    const measure = getMeasure(client.id);
    const orders = state.orders.filter((order) => order.clientId === client.id).length;
    const status = measure ? "Ficha completa" : "Aguardando medidas";

    return `
      <article class="client-card">
        <div>
          <h3>${client.name}</h3>
          <div class="client-meta">${client.profession || ""} | ${client.phone} | ${client.email}</div>
          <div class="client-meta">${client.address || ""}</div>
          <div class="client-meta">${orders} pedido(s) no histórico</div>
        </div>
        <span class="status-pill ${measure ? "done" : "alert"}">${status}</span>
      </article>
    `;
  }).join("");
}

function renderMeasures() {
  const list = document.getElementById("measureList");

  list.innerHTML = state.clients.filter(matchesQuery).map((client) => {
    const measure = getMeasure(client.id);
    if (!measure) {
      return `
        <article class="measure-card">
          <h3>${client.name}</h3>
          <div class="measure-meta">Ficha ainda não preenchida. Pedido bloqueado pela regra RN01.</div>
        </article>
      `;
    }

    return `
      <article class="measure-card">
        <h3>${client.name}</h3>
        <div class="measure-meta">Tórax: ${measure.torax} cm | Ombro: ${measure.ombro} cm | Cintura: ${measure.cintura} cm | Braço: ${measure.braco} cm</div>
      </article>
    `;
  }).join("");
}

function renderOrderCards() {
  const container = document.getElementById("orderCards");
  const visibleOrders = state.orders.filter((order) => matchesQuery(getClient(order.clientId)));

  if (!visibleOrders.length) {
    container.innerHTML = '<div class="empty-state">Nenhum pedido encontrado para a busca atual.</div>';
    return;
  }

  container.innerHTML = visibleOrders.map((order) => {
    const client = getClient(order.clientId);
    if (!client) return "";
    const deadline = deadlineInfo(order);
    const statusClass = order.status === "Pronto para entrega" ? "done" : deadline.critical ? "alert" : "";

    return `
      <article class="order-card">
        <div class="order-card-header">
          <div>
            <h3>${order.model}</h3>
            <div class="order-meta">${client.name} | ${order.fabric}</div>
            <div class="order-meta">Abertura: ${formatDate(order.openedAt)}</div>
            <div class="order-meta">Prazo: ${formatDate(deadline.dueDate)} | ${deadline.label}</div>
          </div>
          <span class="status-pill ${statusClass}">${order.status}</span>
        </div>
        <div class="order-actions">
          <button class="order-action-button edit" data-order-action="edit" data-order-id="${order.id}" type="button">Editar</button>
          <button class="order-action-button delete" data-order-action="delete" data-order-id="${order.id}" type="button">Excluir</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderSelects() {
  const options = state.clients.map((client) => `<option value="${client.id}">${client.name}</option>`).join("");
  document.getElementById("measureClient").innerHTML = options;
  document.getElementById("orderClient").innerHTML = `<option value="">Selecione</option>${options}`;
}

function renderAll() {
  renderMetrics();
  renderOrdersTable();
  renderClients();
  renderMeasures();
  renderOrderCards();
  renderSelects();
}

function validateRequired(form) {
  const fields = Array.from(form.querySelectorAll("[required]"));
  const emptyField = fields.find((field) => !String(field.value).trim());
  if (emptyField) {
    emptyField.focus();
    return "Preencha todos os campos obrigatórios antes de salvar.";
  }

  const email = form.querySelector('input[type="email"]');
  if (email && !email.validity.valid) {
    email.focus();
    return "Informe um e-mail válido para o cliente VIP.";
  }

  return "";
}

function resetOrderForm() {
  const form = document.getElementById("orderForm");
  form.reset();
  document.getElementById("orderId").value = "";
  document.getElementById("orderFormTitle").textContent = "Novo pedido";
  document.getElementById("orderSubmitButton").textContent = "Abrir pedido";
  document.getElementById("cancelOrderEdit").classList.add("d-none");
  setFeedback("orderFeedback", "", "");
}

function selectExistingValue(selectId, value) {
  const select = document.getElementById(selectId);
  const hasOption = Array.from(select.options).some((option) => option.value === value);

  if (!hasOption && value) {
    select.add(new Option(value, value));
  }

  select.value = value;
}

function startOrderEdit(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;

  document.getElementById("orderId").value = order.id;
  document.getElementById("orderClient").value = order.clientId;
  document.getElementById("pieceModel").value = order.model;
  selectExistingValue("fabric", order.fabric);
  selectExistingValue("status", order.status);
  document.getElementById("orderFormTitle").textContent = "Editar pedido";
  document.getElementById("orderSubmitButton").textContent = "Salvar alterações";
  document.getElementById("cancelOrderEdit").classList.remove("d-none");
  document.getElementById("orderForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteOrder(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order || !window.confirm(`Excluir o pedido "${order.model}"?`)) return;

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error("Erro ao excluir pedido");

    if (document.getElementById("orderId").value === orderId) {
      resetOrderForm();
    }
    await fetchData();
    setFeedback("orderFeedback", "Pedido excluído com sucesso.", "success");
  } catch (error) {
    setFeedback("orderFeedback", "Não foi possível excluir o pedido.", "error");
  }
}

document.querySelectorAll("[data-view], [data-view-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const viewId = button.dataset.view || button.dataset.viewTarget;
    document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
    document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === viewId));
    document.getElementById("pageTitle").textContent = titles[viewId];
  });
});

document.getElementById("globalSearch").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderClients();
  renderMeasures();
  renderOrderCards();
});

document.getElementById("orderCards").addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-action]");
  if (!button) return;

  const { orderAction, orderId } = button.dataset;
  if (orderAction === "edit") startOrderEdit(orderId);
  if (orderAction === "delete") deleteOrder(orderId);
});

document.getElementById("cancelOrderEdit").addEventListener("click", resetOrderForm);

document.getElementById("refreshData").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const originalText = button.textContent;

  button.disabled = true;
  button.textContent = "Atualizando...";
  await fetchData();
  button.textContent = originalText;
  button.disabled = false;
});

document.getElementById("clientForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const validationMessage = validateRequired(form);

  if (validationMessage) {
    setFeedback("clientFeedback", validationMessage, "error");
    return;
  }

  const formData = new FormData(form);
  const email = formData.get("email").trim().toLowerCase();
  const phone = formData.get("phone").trim();
  const duplicated = state.clients.some((client) => client.email.toLowerCase() === email || client.phone === phone);

  if (duplicated) {
    setFeedback("clientFeedback", "E-mail ou telefone já cadastrado no sistema.", "error");
    return;
  }

  const payload = {
    name: formData.get("name").trim(),
    phone,
    email,
    profession: formData.get("profession").trim(),
    address: formData.get("address").trim(),
    active: true
  };

  try {
    const res = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Erro ao salvar no backend");

    await fetchData();
    form.reset();
    setFeedback("clientFeedback", "Cliente cadastrado com sucesso.", "success");
  } catch (error) {
    setFeedback("clientFeedback", "Erro ao conectar ao servidor.", "error");
  }
});

document.getElementById("measureForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const validationMessage = validateRequired(form);

  if (validationMessage) {
    setFeedback("measureFeedback", validationMessage, "error");
    return;
  }

  const formData = new FormData(form);
  const payload = {
    clientId: formData.get("clientId"),
    torax: Number(formData.get("torax")),
    ombro: Number(formData.get("ombro")),
    cintura: Number(formData.get("cintura")),
    braco: Number(formData.get("braco"))
  };

  try {
    const res = await fetch(`${API_URL}/measures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Erro ao salvar no backend");

    await fetchData();
    form.reset();
    setFeedback("measureFeedback", "Ficha de medidas atualizada.", "success");
  } catch (error) {
    setFeedback("measureFeedback", "Erro ao conectar ao servidor.", "error");
  }
});

document.getElementById("orderForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const validationMessage = validateRequired(form);

  if (validationMessage) {
    setFeedback("orderFeedback", validationMessage, "error");
    return;
  }

  const formData = new FormData(form);
  const clientId = formData.get("clientId");
  const orderId = formData.get("orderId");

  if (!getMeasure(clientId)) {
    setFeedback("orderFeedback", "Pedido bloqueado: o cliente precisa ter ficha de medidas preenchida.", "error");
    return;
  }

  const payload = {
    clientId,
    model: formData.get("model").trim(),
    fabric: formData.get("fabric"),
    status: formData.get("status"),
    openedAt: orderId
      ? state.orders.find((order) => order.id === orderId)?.openedAt
      : new Date().toISOString().split("T")[0]
  };

  try {
    const res = await fetch(orderId ? `${API_URL}/orders/${orderId}` : `${API_URL}/orders`, {
      method: orderId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Erro ao salvar no backend");

    await fetchData();
    resetOrderForm();
    setFeedback(
      "orderFeedback",
      orderId ? "Pedido atualizado com sucesso." : "Pedido de confecção aberto com sucesso.",
      "success"
    );
  } catch (error) {
    setFeedback("orderFeedback", "Erro ao conectar ao servidor.", "error");
  }
});

fetchData();
