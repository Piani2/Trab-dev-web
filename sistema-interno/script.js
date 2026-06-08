const state = {
  clients: [
    {
      id: 1,
      name: "Henrique Valenca",
      phone: "(11) 98422-0194",
      email: "henrique.valenca@email.com",
      profession: "Advogado",
      address: "Av. Paulista, 1578 - Sao Paulo",
      active: true
    },
    {
      id: 2,
      name: "Marina Azevedo",
      phone: "(11) 97741-3029",
      email: "marina.azevedo@email.com",
      profession: "Executiva",
      address: "Rua Oscar Freire, 310 - Sao Paulo",
      active: true
    },
    {
      id: 3,
      name: "Caio Monteiro",
      phone: "(11) 96888-4412",
      email: "caio.monteiro@email.com",
      profession: "Empresario",
      address: "Alameda Santos, 920 - Sao Paulo",
      active: true
    }
  ],
  measures: [
    { clientId: 1, torax: 102, ombro: 46, cintura: 88, braco: 62 },
    { clientId: 2, torax: 91, ombro: 40, cintura: 72, braco: 58 }
  ],
  orders: [
    { id: 1, clientId: 1, model: "Terno tres pecas", fabric: "La fria", status: "Em corte", openedAt: "2026-05-15" },
    { id: 2, clientId: 2, model: "Vestido de gala", fabric: "Seda", status: "Em costura", openedAt: "2026-05-24" },
    { id: 3, clientId: 1, model: "Blazer sob medida", fabric: "Linho", status: "Pronto para entrega", openedAt: "2026-05-09" }
  ],
  query: ""
};

const titles = {
  dashboard: "Painel de acompanhamento",
  clientes: "Gestao de clientes VIP",
  medidas: "Ficha de medidas",
  pedidos: "Pedidos de confeccao"
};

const today = new Date("2026-06-07T12:00:00");

function getClient(id) {
  return state.clients.find((client) => client.id === Number(id));
}

function getMeasure(clientId) {
  return state.measures.find((measure) => measure.clientId === Number(clientId));
}

function deadlineInfo(openedAt) {
  const openedDate = new Date(`${openedAt}T12:00:00`);
  const limitDate = new Date(openedDate);
  limitDate.setDate(limitDate.getDate() + 30);
  const remaining = Math.ceil((limitDate - today) / 86400000);

  return {
    remaining,
    label: remaining < 0 ? `${Math.abs(remaining)} dias atrasado` : `${remaining} dias restantes`,
    critical: remaining <= 7
  };
}

function matchesQuery(client) {
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
  const criticalOrders = state.orders.filter((order) => deadlineInfo(order.openedAt).critical).length;

  document.getElementById("metricClients").textContent = state.clients.filter((client) => client.active).length;
  document.getElementById("metricMeasures").textContent = completeMeasures;
  document.getElementById("metricOrders").textContent = activeOrders;
  document.getElementById("metricDeadlines").textContent = criticalOrders;
}

function renderOrdersTable() {
  const table = document.getElementById("ordersTable");
  table.innerHTML = state.orders.map((order) => {
    const client = getClient(order.clientId);
    const deadline = deadlineInfo(order.openedAt);
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
          <div class="client-meta">${client.profession} | ${client.phone} | ${client.email}</div>
          <div class="client-meta">${client.address}</div>
          <div class="client-meta">${orders} pedido(s) no historico</div>
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
          <div class="measure-meta">Ficha ainda nao preenchida. Pedido bloqueado pela regra RN01.</div>
        </article>
      `;
    }

    return `
      <article class="measure-card">
        <h3>${client.name}</h3>
        <div class="measure-meta">Torax: ${measure.torax} cm | Ombro: ${measure.ombro} cm | Cintura: ${measure.cintura} cm | Braco: ${measure.braco} cm</div>
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
    const deadline = deadlineInfo(order.openedAt);
    const statusClass = order.status === "Pronto para entrega" ? "done" : deadline.critical ? "alert" : "";

    return `
      <article class="order-card">
        <h3>${order.model}</h3>
        <div class="order-meta">${client.name} | ${order.fabric}</div>
        <div class="order-meta">Aberto em ${order.openedAt} | ${deadline.label}</div>
        <span class="status-pill ${statusClass}">${order.status}</span>
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
    return "Preencha todos os campos obrigatorios antes de salvar.";
  }

  const email = form.querySelector('input[type="email"]');
  if (email && !email.validity.valid) {
    email.focus();
    return "Informe um e-mail valido para o cliente VIP.";
  }

  return "";
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

document.getElementById("clientForm").addEventListener("submit", (event) => {
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
    setFeedback("clientFeedback", "E-mail ou telefone ja cadastrado no sistema.", "error");
    return;
  }

  state.clients.push({
    id: Date.now(),
    name: formData.get("name").trim(),
    phone,
    email,
    profession: formData.get("profession").trim(),
    address: formData.get("address").trim(),
    active: true
  });

  form.reset();
  setFeedback("clientFeedback", "Cliente cadastrado com sucesso.", "success");
  renderAll();
});

document.getElementById("measureForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const validationMessage = validateRequired(form);

  if (validationMessage) {
    setFeedback("measureFeedback", validationMessage, "error");
    return;
  }

  const formData = new FormData(form);
  const clientId = Number(formData.get("clientId"));
  const existing = getMeasure(clientId);
  const payload = {
    clientId,
    torax: formData.get("torax"),
    ombro: formData.get("ombro"),
    cintura: formData.get("cintura"),
    braco: formData.get("braco")
  };

  if (existing) {
    Object.assign(existing, payload);
  } else {
    state.measures.push(payload);
  }

  form.reset();
  setFeedback("measureFeedback", "Ficha de medidas atualizada.", "success");
  renderAll();
});

document.getElementById("orderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const validationMessage = validateRequired(form);

  if (validationMessage) {
    setFeedback("orderFeedback", validationMessage, "error");
    return;
  }

  const formData = new FormData(form);
  const clientId = Number(formData.get("clientId"));

  if (!getMeasure(clientId)) {
    setFeedback("orderFeedback", "Pedido bloqueado: o cliente precisa ter ficha de medidas preenchida.", "error");
    return;
  }

  state.orders.push({
    id: Date.now(),
    clientId,
    model: formData.get("model").trim(),
    fabric: formData.get("fabric"),
    status: formData.get("status"),
    openedAt: "2026-06-07"
  });

  form.reset();
  setFeedback("orderFeedback", "Pedido de confeccao aberto com sucesso.", "success");
  renderAll();
});

renderAll();
